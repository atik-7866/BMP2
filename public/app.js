const form = document.querySelector('#search-form');
const queryInput = document.querySelector('#query');
const loading = document.querySelector('#loading');
const results = document.querySelector('#results');
const errorMessage = document.querySelector('#error');
const answer = document.querySelector('#answer');
const graphResults = document.querySelector('#graph-results');
const graphCount = document.querySelector('#graph-count');
const semanticResults = document.querySelector('#semantic-results');

for (const example of document.querySelectorAll('[data-query]')) {
  example.addEventListener('click', () => {
    queryInput.value = example.dataset.query;
    queryInput.focus();
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (!query) return;

  loading.hidden = false;
  results.hidden = true;
  errorMessage.hidden = true;

  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Search failed.');
    renderResults(payload);
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.hidden = false;
  } finally {
    loading.hidden = true;
  }
});

function renderResults(payload) {
  answer.textContent = payload.answer || 'No answer was generated.';
  const rows = payload.results?.graphResults || [];
  graphCount.textContent = `${rows.length} result${rows.length === 1 ? '' : 's'}`;
  graphResults.innerHTML = rows.length ? rows.map(renderGraphRow).join('') : '<p class="result-card"><span>No graph matches were found for this question.</span></p>';
  semanticResults.textContent = JSON.stringify(payload.results?.semanticResults || {}, null, 2);
  results.hidden = false;
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderGraphRow(row) {
  const title = row.movie || row.director || row.actor || row.genre || row.theme || row.award || 'Match';
  const details = row.movie
    ? [row.year, list(row.directors), list(row.actors), list(row.genres), list(row.awards)].filter(Boolean).join('  ·  ')
    : list(row.movies) || list(row.awards);
  return `<article class="result-card"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(details || 'Related archive match')}</span></article>`;
}

function list(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (value && typeof value === 'object' && 'low' in value) return String(value.low);
  return value == null ? '' : String(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}
