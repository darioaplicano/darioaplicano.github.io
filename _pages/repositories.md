---
layout: page
permalink: /repositories/
title: repositories
description: Perfil de GitHub y repos publicos. Codigo, ejercicios de cursos y proyectos personales en Python, Scala, TypeScript y mas.
nav: true
nav_order: 4
---

<style>
  .user-card,
  .repo-card {
    border: 1px solid var(--global-divider-color, #e0e0e0);
    border-radius: 6px;
    background: var(--global-card-bg-color, transparent);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .user-card:hover,
  .repo-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  .user-card-link,
  .repo-card-link {
    display: block;
    color: inherit;
    text-decoration: none;
  }
  .user-card { text-align: center; max-width: 280px; }
  .user-card-avatar {
    width: 96px; height: 96px; border-radius: 50%;
    object-fit: cover; margin-bottom: 0.75rem;
  }
  .user-card-name { font-weight: 600; font-size: 1.1rem; }
  .user-card-login { color: var(--global-text-color-light, #888); font-size: 0.9rem; margin-bottom: 0.5rem; }
  .user-card-bio { font-size: 0.9rem; margin: 0.5rem 0; min-height: 1.2em; }
  .user-card-meta { display: flex; justify-content: center; gap: 1rem; font-size: 0.85rem; color: var(--global-text-color-light, #666); }
  .repo-card { width: 100%; max-width: 360px; }
  .repo-card-title { font-weight: 600; margin-bottom: 0.35rem; }
  .repo-card-owner { color: var(--global-text-color-light, #888); }
  .repo-card-name { color: var(--global-theme-color, #007bff); }
  .repo-card-desc {
    font-size: 0.9rem; margin: 0.25rem 0 0.5rem;
    color: var(--global-text-color, #333);
    min-height: 2.6em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .repo-card-meta {
    display: flex; gap: 1rem; font-size: 0.82rem;
    color: var(--global-text-color-light, #666);
  }
  .repo-card-lang:not(:empty)::before { content: "● "; color: var(--global-theme-color, #007bff); }
</style>

{% if site.data.repositories.github_users %}

## GitHub users

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-center align-items-center">
  {% for user in site.data.repositories.github_users %}
    {% include repository/repo_user.liquid username=user %}
  {% endfor %}
</div>

---

{% if site.repo_trophies.enabled %}
{% for user in site.data.repositories.github_users %}
{% if site.data.repositories.github_users.size > 1 %}

  <h4>{{ user }}</h4>
  {% endif %}
  <div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% include repository/repo_trophies.liquid username=user %}
  </div>

---

{% endfor %}
{% endif %}
{% endif %}

{% if site.data.repositories.github_repos %}

## GitHub Repositories

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-center align-items-stretch" style="gap: 0.75rem;">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}

<script>
  (function () {
    var CACHE_KEY = 'gh-cards-cache-v1';
    var TTL_MS = 60 * 60 * 1000; // 1 hour
    var cache = {};
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Date.now() - parsed.t < TTL_MS) cache = parsed.d || {};
      }
    } catch (e) {}

    function persist() {
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: cache })); } catch (e) {}
    }

    function fill(el, data) {
      el.querySelectorAll('[data-field]').forEach(function (f) {
        var v = data[f.dataset.field];
        if (v !== null && v !== undefined && v !== '') f.textContent = v;
      });
    }

    function fetchAndFill(url, key, el) {
      if (cache[key]) { fill(el, cache[key]); return; }
      fetch(url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (data) {
        cache[key] = data;
        persist();
        fill(el, data);
      }).catch(function () {});
    }

    document.querySelectorAll('.repo-card[data-repo]').forEach(function (card) {
      fetchAndFill('https://api.github.com/repos/' + card.dataset.repo, 'r:' + card.dataset.repo, card);
    });
    document.querySelectorAll('.user-card[data-user]').forEach(function (card) {
      fetchAndFill('https://api.github.com/users/' + card.dataset.user, 'u:' + card.dataset.user, card);
    });
  })();
</script>
