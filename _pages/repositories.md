---
layout: page
permalink: /repositories/
title: repositorios
description: Perfil de GitHub y repos públicos. Código, ejercicios de cursos y proyectos personales en Python, Scala, TypeScript y más.
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
  .repos-placeholder { text-align: center; color: var(--global-text-color-light, #888); padding: 1rem; }
</style>

{% if site.data.repositories.github_users %}

## Perfil de GitHub

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-center align-items-center">
  {% for user in site.data.repositories.github_users %}
    {% include repository/repo_user.liquid username=user %}
  {% endfor %}
</div>

---

## Repositorios

<div id="repos-list" class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-center align-items-stretch" style="gap: 0.75rem;">
  <p class="repos-placeholder">Cargando repositorios de GitHub…</p>
</div>
{% endif %}

<script>
  (function () {
    var CACHE_KEY = 'gh-cards-cache-v2';
    var TTL_MS = 60 * 60 * 1000; // 1h
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

    function escapeHtml(s) {
      if (s == null) return '';
      return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function userCardFill(el, data) {
      el.querySelectorAll('[data-field]').forEach(function (f) {
        var v = data[f.dataset.field];
        if (v !== null && v !== undefined && v !== '') f.textContent = v;
      });
    }

    function fetchUser(username, el) {
      var key = 'u:' + username;
      if (cache[key]) { userCardFill(el, cache[key]); return; }
      fetch('https://api.github.com/users/' + username)
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) { cache[key] = data; persist(); userCardFill(el, data); })
        .catch(function () {});
    }

    function repoCard(repo) {
      var desc = repo.description ? escapeHtml(repo.description) : '';
      var lang = repo.language ? escapeHtml(repo.language) : '';
      return (
        '<div class="repo-card p-3 mb-2">' +
          '<a href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener noreferrer" class="repo-card-link">' +
            '<div class="repo-card-title">' +
              '<i class="fa-regular fa-bookmark me-1"></i>' +
              '<span class="repo-card-name">' + escapeHtml(repo.name) + '</span>' +
            '</div>' +
            '<p class="repo-card-desc">' + desc + '</p>' +
            '<div class="repo-card-meta">' +
              '<span class="repo-card-lang">' + lang + '</span>' +
              '<span><i class="fa-regular fa-star"></i> ' + (repo.stargazers_count || 0) + '</span>' +
              '<span><i class="fa-solid fa-code-fork"></i> ' + (repo.forks_count || 0) + '</span>' +
            '</div>' +
          '</a>' +
        '</div>'
      );
    }

    function renderRepos(list, container) {
      var filtered = list.filter(function (r) { return !r.fork && !r.archived; });
      filtered.sort(function (a, b) {
        if (b.stargazers_count !== a.stargazers_count) return b.stargazers_count - a.stargazers_count;
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      });
      if (filtered.length === 0) {
        container.innerHTML = '<p class="repos-placeholder">No hay repositorios públicos.</p>';
        return;
      }
      container.innerHTML = filtered.map(repoCard).join('');
    }

    function fetchRepos(username, container) {
      var key = 'list:' + username;
      if (cache[key]) { renderRepos(cache[key], container); return; }
      fetch('https://api.github.com/users/' + username + '/repos?per_page=100&sort=updated')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) { cache[key] = data; persist(); renderRepos(data, container); })
        .catch(function () {
          container.innerHTML = '<p class="repos-placeholder">No se pudieron cargar los repositorios. Intenta refrescar más tarde.</p>';
        });
    }

    document.querySelectorAll('.user-card[data-user]').forEach(function (card) {
      fetchUser(card.dataset.user, card);
    });
    var reposContainer = document.getElementById('repos-list');
    if (reposContainer) {
      {% if site.data.repositories.github_users %}
        var primaryUser = {{ site.data.repositories.github_users[0] | jsonify }};
        fetchRepos(primaryUser, reposContainer);
      {% endif %}
    }
  })();
</script>
