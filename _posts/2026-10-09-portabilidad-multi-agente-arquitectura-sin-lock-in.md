---
layout: post
title: "Portabilidad multi-agente: cómo diseñar un entorno de trabajo independiente del LLM y de la CLI"
date: 2026-10-09
categories: [ia, arquitectura]
tags: [agentes-ia, mcp, devops, productividad, aiops]
description: "Por qué acoplar tus flujos a un único asistente de IA es un riesgo operativo y cómo desacoplar el modelo, el harness y las herramientas para evitar el vendor lock-in."
---

En el último año, el desarrollo asistido por IA ha pasado de autocompletar líneas a desplegar agentes autónomos en la terminal capaces de leer repositorios, ejecutar comandos y coordinar llamadas a APIs.

Con este salto ha surgido un riesgo clásico de la ingeniería de software: **el vendor lock-in**. Muchos flujos de trabajo quedan atrapados en un plugin cerrado, un formato propietario de instrucciones o una CLI atada a un único proveedor. Si mañana ese servicio cambia sus precios, degrada su modelo (o tu empresa impone un proxy corporativo que lo bloquea), tu operativa se detiene.

Para evitarlo, la clave es aplicar un patrón básico de arquitectura y desacoplar el sistema en tres capas independientes.

---

## El desacoplamiento en tres capas

Para diseñar un entorno realmente portátil, conviene separar qué hace cada pieza:

```text
┌────────────────────────────────────────────────────────┐
│ 1. Modelo (LLM): Razonamiento                          │
│    (Claude, Gemini, GPT, DeepSeek, modelos locales)     │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│ 2. Harness / Agente: Orquestación y ejecución           │
│    (Claude Code, OpenCode, Antigravity, Copilot, etc.)  │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│ 3. Contexto y Tools: Tu activo permanente              │
│    (Markdown plano + Agent Skills + Protocolo MCP)     │
└────────────────────────────────────────────────────────┘
```

1. **El Modelo (el cerebro):** Procesa el contexto, razona y decide qué herramienta invocar. Es fungible: puedes alternar entre modelos de frontera para refactorizaciones complejas o modelos locales/más ligeros para revisiones rutinarias.
2. **El Harness (el motor de ejecución):** La CLI o aplicación que gestiona el bucle de interacción, renderiza la terminal, administra permisos y expone herramientas del sistema.
3. **El Contexto y las Herramientas (tu activo real):** Tu base de conocimiento, tus reglas operativas y las conexiones a tus sistemas. Esta capa debe construirse exclusivamente sobre estándares abiertos.

Si aislas la capa 3, cambiar de *harness* o de modelo deja de ser una migración traumática y pasa a ser un mero cambio de configuración de cinco minutos.

---

## 1. El conocimiento en Markdown plano

Las memorias propietarias de los asistentes suelen ser cajas negras rara vez exportables. Si guardas tus notas de arquitectura, bitácoras de incidencias y reglas operativas en la base de datos interna del agente, tu información queda secuestrada.

El estándar más robusto sigue siendo **Markdown plano**. Mantener tus instrucciones en tu propio sistema de archivos te da:
- **Control total:** Funciona con Git, versionado estándar y sincronización local.
- **Independencia absoluta:** Cualquier agente puede leerlo y editarlo usando herramientas nativas de lectura o búsqueda por comandos (Grep/Glob).
- **Inmutabilidad:** Si cambias de agente, tu historial de decisiones documentadas sigue intacto y accesible.

---

## 2. Herramientas universales con MCP (Model Context Protocol)

Antes de MCP, conectar un agente a una base de datos (ClickHouse, PostgreSQL) o a servicios externos (GitHub, Jira, correo) exigía escribir integraciones a medida para el SDK de cada asistente.

Con **Model Context Protocol (MCP)**, las herramientas se declaran como servidores independientes. El agente consume esas herramientas mediante JSON-RPC sobre `stdio` o `SSE`. 

En la práctica, un servidor MCP escrito para interactuar con tu gestor de incidencias funciona exactamente igual tanto si lo conectas a Claude Code como a OpenCode o Antigravity. Aunque cada CLI utilice su propio fichero para registrar los servidores (un `.mcp.json` o un `opencode.json`), el código subyacente no se toca. Escribes la integración una sola vez.

---

## 3. Habilidades declarativas: Agent Skills como fuente única de verdad

Para que varios agentes ejecuten los mismos procedimientos complejos (auditar un clúster, procesar métricas diarias o validar configuraciones), las instrucciones deben residir en un único punto.

El formato abierto de **Agent Skills** (un directorio por habilidad con un archivo `SKILL.md` que incluye *frontmatter* con descripción y reglas) permite que distintos agentes carguen el mismo procedimiento de forma nativa:

```yaml
---
name: auditoria-cluster
description: Inspecciona el estado de los nodos, espacio en disco y servicios caídos mediante Ansible e InfluxDB. En modo solo lectura.
---
```

Al mantener una única carpeta compartida (`.agents/skills/`), cualquier mejora que hagas en un *prompt* procedimental beneficia de inmediato a todos los agentes de tu ecosistema.

---

## 4. Seguridad y gestión de secretos: un proceso de mejora continua

Un problema recurrente al orquestar herramientas de IA es la dispersión de credenciales: tokens pegados en archivos de configuración en texto plano, secretos duplicados o permisos excesivos concedidos "por si acaso".

La seguridad en sistemas agénticos no es un *check* que se marca una vez; es una disciplina viva donde **siempre hay margen para el endurecimiento progresivo**:

1. **Higiene básica:** Erradicar cualquier secreto en texto plano de los archivos de configuración de los agentes.
2. **Variables del sistema:** Delegar las credenciales al entorno del sistema operativo (`GITHUB_TOKEN`, tokens de APIs). Los agentes las consumen por interpolación (`${VAR}`). Un script ligero de *bootstrap* (`bootstrap-secrets.ps1` o similar) puede validar que existan al arrancar en una máquina nueva, sin tocar el repositorio.
3. **Gestores dedicados:** En entornos maduros, conectar las herramientas a bóvedas de secretos corporativas (Azure Key Vault, HashiCorp Vault) en lugar de depender del perfil del usuario.
4. **Sandboxing y perímetro:** Aislar la ejecución real del agente en tu máquina local. Usar herramientas como `bubblewrap` (bwrap) para limitar qué puede tocar el asistente en tu sistema de archivos, y aplicar permisos de "solo lectura" por defecto en los servidores MCP que se conectan a producción.

Asumir que la postura de seguridad es iterativa evita la parálisis por análisis y te permite elevar la protección a medida que delegas tareas más críticas.

---

## Conclusión práctica

En la era agéntica, tu ventaja técnica no reside en qué CLI estás utilizando esta semana, sino en la calidad de tu contexto y la modularidad de tus herramientas.

Construir sobre Markdown, MCP y especificaciones abiertas garantiza que tu ecosistema evolucione al ritmo de la industria, permitiéndote enchufar el mejor modelo y el mejor motor del momento sin tirar a la basura ni un solo día de trabajo.
