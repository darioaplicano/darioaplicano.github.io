---
layout: post
title: "De Chatbots a Agentes: Arquitectura de Sistemas Agénticos en Producción con LangGraph y MCP"
date: 2026-09-18 08:00:00 +0200
description: "Cómo evolucionar de simples flujos lineales de pregunta-respuesta a arquitecturas agénticas basadas en grafos de estado con LangGraph y herramientas desacopladas mediante el Model Context Protocol (MCP)."
tags: [agentes-ia, langgraph, mcp, python, aiops]
categories: [inteligencia-artificial, arquitectura]
toc:
  beginning: true
---

Durante los dos últimos años, la mayor parte de las implementaciones de IA Generativa en empresas se limitaron al paradigma conversacional: una interfaz de chat, una cadena lineal de LangChain o LlamaIndex, y una base de datos vectorial para hacer RAG (Retrieval-Augmented Generation). 

Aunque este patrón resolvió casos de uso de soporte y consulta documental, **fracasa rotundamente cuando el objetivo es la automatización operativa real**. 

Un sistema en producción no necesita simplemente responder preguntas sobre documentación; necesita **diagnosticar incidencias, consultar telemetría, correlacionar eventos, proponer acciones y ejecutarlas bajo supervisión**. Para dar ese salto, debemos movernos del modelo *«pregunta → respuesta»* a sistemas agénticos gobernados por **grafos de estado** y apoyados en protocolos universales de herramientas como **Model Context Protocol (MCP)**.

---

## 1. La limitación de las cadenas lineales

En un flujo tradicional (como un `LLMChain` o un pipeline secuencial de LangChain), la ejecución es determinista y unidireccional:

$$Input \longrightarrow Prompt \longrightarrow LLM \longrightarrow Output$$

En el mundo real de las operaciones y la ingeniería de datos:
- Una consulta a la base de datos puede fallar por un timeout o una sintaxis incorrecta.
- Una métrica anómala requiere profundizar con una segunda consulta a otra fuente antes de concluir un diagnóstico.
- La salida del modelo puede requerir una validación intermedia o una confirmación humana (*Human-in-the-Loop*) antes de aplicar un cambio de configuración.

Forzar esta dinámica sobre cadenas lineales produce código frágil, lleno de `try/except` anidados y bucles `while` difíciles de depurar. Aquí es donde **LangGraph** cambia las reglas del juego.

---

## 2. Orquestación mediante Grafos de Estado (LangGraph)

LangGraph no concibe al agente como una caja negra que improvisa llamadas en un bucle ciego, sino como una **máquina de estados finita modelada como un grafo dirigido**.

Los tres conceptos fundamentales de esta arquitectura son:

1. **Estado Tipado (`State`):** Un esquema centralizado (normalmente un `TypedDict` o un modelo Pydantic) que viaja a través de todos los nodos. Todo lo que el agente aprende, genera o recibe se acumula en este estado.
2. **Nodos (`Nodes`):** Funciones o llamadas a modelos que reciben el estado actual, realizan una operación (invocar al LLM, ejecutar una consulta) y retornan una mutación sobre el estado.
3. **Aristas Condicionales (`Conditional Edges`):** Funciones de decisión que analizan el estado resultante y determinan cuál es el siguiente nodo: ¿debe ejecutarse otra herramienta, debe pedirse validación a un humano o se puede dar por finalizada la tarea?

```python
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # La anotación add_messages asegura que los mensajes se agreguen cronológicamente
    messages: Annotated[list, add_messages]
    sender: str
    requires_human_approval: bool
```

Al desacoplar el estado de la ejecución, ganamos dos propiedades críticas para producción:
- **Persistencia y checkpointing:** Si el contenedor se cae o se requiere aprobación humana durante horas, el estado completo del grafo se persiste (en PostgreSQL, SQLite o Redis) y se reanuda exactamente donde se quedó.
- **Tolerancia a ciclos y límites:** Podemos fijar un umbral estricto de iteraciones (*recursion limit*) para evitar que un agente entre en un bucle infinito de herramientas consumiendo miles de tokens.

---

## 3. El eslabón que faltaba: Model Context Protocol (MCP)

Durante mucho tiempo, conectar un agente a herramientas externas (bases de datos, logs, plataformas cloud) significaba escribir conectores ad-hoc para cada biblioteca o framework. Si cambiabas de LangChain a AutoGen o a un script nativo, tenías que rehacer la integración de herramientas.

El **Model Context Protocol (MCP)**, impulsado por Anthropic como estándar abierto, resuelve esto de raíz al establecer un protocolo cliente-servidor universal basado en JSON-RPC:

```
[ Agente / LangGraph ] 
         │  (JSON-RPC sobre stdio / SSE)
         ▼
[ Servidor MCP ] ────► [ ClickHouse / Azure / APIs / Kubernetes ]
```

### ¿Por qué MCP es transformador para la ingeniería de operaciones?

1. **Desacoplamiento total:** El servidor MCP se ejecuta en su propio entorno (o contenedor aislado), con sus dependencias, credenciales y validaciones de seguridad. El agente no necesita librerías cliente directas.
2. **Seguridad y principio de mínimo privilegio:** El servidor MCP expone exclusivamente contratos de herramientas tipados (`tools`), recursos de solo lectura (`resources`) o plantillas de interacción (`prompts`).
3. **Reutilización transversal:** El mismo servidor MCP que utilizas para que tu agente LangGraph consulte métricas operativas puede ser consumido por un desarrollador en su IDE o por un CLI automatizado.

---

## 4. Ensamblando el patrón: De la teoría al código

Imaginemos un agente de diagnóstico operativo cuyo objetivo es evaluar la degradación de un servicio de streaming.

### Paso A: Conexión con herramientas MCP
El agente carga el catálogo de herramientas directamente desde el servidor MCP:

```python
from langchain_core.tools import tool

# Supongamos que el servidor MCP expone la herramienta 'query_service_metrics'
# El cliente MCP traduce la definición JSON Schema a una herramienta ejecutable
tools = [mcp_client.get_tool("query_service_metrics")]
model = ChatOpenAI(model="gpt-4o", temperature=0).bind_tools(tools)
```

### Paso B: Construcción del grafo de razonamiento y acción

```python
workflow = StateGraph(AgentState)

# 1. Nodo del modelo: Razona sobre el estado actual
def agent_node(state: AgentState):
    response = model.invoke(state["messages"])
    return {"messages": [response], "sender": "agent"}

# 2. Nodo de ejecución: Ejecuta las herramientas solicitadas vía MCP
def tool_node(state: AgentState):
    last_message = state["messages"][-1]
    results = []
    for call in last_message.tool_calls:
        tool_result = execute_mcp_tool(call["name"], call["args"])
        results.append(tool_result)
    return {"messages": results, "sender": "tool"}

# 3. Arista condicional: ¿El modelo solicitó herramientas o respondió?
def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

# Definición de la topología
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue, {
    "tools": "tools",
    END: END
})
workflow.add_edge("tools", "agent")  # El resultado vuelve al agente para interpretación

app = workflow.compile()
```

Este flujo permite que el agente consulte una métrica en el servidor MCP, interprete el resultado, decida si necesita correlacionarla con una segunda fuente de datos y solo cuando tenga el diagnóstico completo emita la respuesta final.

---

## 5. Lecciones aprendidas para producción

Diseñar agentes para demos es sencillo; hacer que operen con fiabilidad en sistemas empresariales exige rigor arquitectónico:

### A. Idempotencia y acciones destructivas
Las herramientas que leen datos (selects en ClickHouse, inspección de pods, lectura de logs) pueden ejecutarse con relativa libertad. Las herramientas que alteran estado (reiniciar un contenedor, modificar una regla de firewall) **deben exigir confirmación humana explícita** mediante interrupciones en el grafo (`interrupt_before`).

### B. Control de contexto y costes de tokens
Un agente que realiza 6 llamadas sucesivas a herramientas acumula miles de tokens en su historial de mensajes. En producción es indispensable implementar **resúmenes intermedios de memoria** o podar los payloads JSON muy extensos devueltos por las APIs antes de reinyectarlos en el contexto del modelo.

### C. Observabilidad del proceso de razonamiento
Monitorear un agente no es medir cuántas llamadas HTTP completó. Requiere registrar:
- Cuántos pasos necesitó para resolver la petición.
- Qué herramientas invocó y con qué argumentos.
- Cuántos tokens consumió por cada fase (razonamiento vs. ejecución).
- La tasa de éxito al primer intento vs. reintentos tras errores.

---

## Conclusión

El valor real de la Inteligencia Artificial en la ingeniería de sistemas no proviene de generar texto elocuente, sino de su capacidad para actuar como un **orquestador cognitivo robusto**.

Combinando **LangGraph** para gobernar el flujo de ejecución mediante grafos de estado tipados y **Model Context Protocol (MCP)** para desacoplar y estandarizar la interacción con nuestras plataformas, convertimos a los agentes en piezas de ingeniería predecibles, auditables y listas para operar en entornos reales de misión crítica.
