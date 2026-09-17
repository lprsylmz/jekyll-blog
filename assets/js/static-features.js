/* Static replacements for the Livewire-only filters. The public markup and
 * all existing visual styles stay untouched. */
(() => {
  const query = new URLSearchParams(window.location.search);
  const tag = query.get('tag');
  const author = query.get('author');

  const applyBlogFilter = () => {
    const items = [...document.querySelectorAll('.post-item[data-tags]')];
    if (!items.length || (!tag && !author)) return;
    items.forEach((item) => {
      const tags = item.dataset.tags.split(',').map((value) => value.trim());
      const authorLink = item.querySelector('a[href*="author="]');
      const itemAuthor = authorLink && new URL(authorLink.href).searchParams.get('author');
      item.hidden = (tag && !tags.includes(tag)) || (author && itemAuthor !== author);
    });
  };

  const applyJournalFilter = () => {
    const notes = [...document.querySelectorAll('article[id^="note-"]')];
    if (!notes.length || !tag) return;
    notes.forEach((note) => {
      note.hidden = !new RegExp(`#${tag}(?![\\w-])`, 'iu').test(note.innerText);
    });
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[wire\\:click]');
    if (!button) return;
    const action = button.getAttribute('wire:click') || '';
    const match = action.match(/^setTag\(['\"]?([^'\")]+)['\"]?\)$/);
    if (match) {
      event.preventDefault();
      const url = new URL(window.location.href);
      url.searchParams.set('tag', match[1]);
      window.location.assign(url);
    }
    if (action === 'resetFilter') {
      event.preventDefault();
      const url = new URL(window.location.href);
      url.searchParams.delete('tag');
      window.location.assign(url);
    }
  });

  applyBlogFilter();
  applyJournalFilter();
})();
