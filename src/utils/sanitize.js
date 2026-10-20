const ALLOWED_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'EM', 'H2', 'H3', 'H4',
  'HR', 'I', 'IMG', 'LI', 'OL', 'P', 'PRE', 'S', 'STRONG', 'TABLE',
  'TBODY', 'TD', 'TH', 'THEAD', 'TR', 'UL'
]);
const ALLOWED_ATTRIBUTES = new Set(['alt', 'colspan', 'href', 'rowspan', 'src', 'target', 'title']);
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

function isAllowedUrl(value, allowRelative) {
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin === window.location.origin && allowRelative) return true;
    return ALLOWED_PROTOCOLS.has(url.protocol);
  } catch (e) {
    return false;
  }
}

export function sanitizeRichText(content) {
  if (!content) return '';
  const document = new DOMParser().parseFromString(String(content), 'text/html');
  document.querySelectorAll('script,style,iframe,object,embed,form,base,meta,link,svg,math,template').forEach(node => node.remove());
  document.body.querySelectorAll('*').forEach(node => {
    if (!ALLOWED_TAGS.has(node.tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }
    Array.from(node.attributes).forEach(attribute => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      const isUrl = name === 'href' || name === 'src';
      if (!ALLOWED_ATTRIBUTES.has(name) || (isUrl && !isAllowedUrl(value, true))) {
        node.removeAttribute(attribute.name);
      }
    });
    if (node.tagName === 'A') {
      node.setAttribute('rel', 'noopener noreferrer nofollow');
      if (node.getAttribute('target') !== '_self') node.setAttribute('target', '_blank');
    }
  });
  return document.body.innerHTML;
}
