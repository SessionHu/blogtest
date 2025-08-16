import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  xhtmlOut: true,
});

const defaultRendererRulesFence = md.renderer.rules.fence;
md.renderer.rules.fence = (
  /** @type {import('markdown-it/lib/token.mjs').default[]} */ tokens,
  /** @type {number} */ idx,
  /** @type {import('markdown-it').Options} */ options,
  /** @type {any} */ env,
  /** @type {import('markdown-it/lib/renderer.mjs').default} */ self
) => {
  const token = tokens[idx];
  const langName = token.info.trim();
  token.attrSet('class', 'layui-code');
  token.attrSet('lay-options', `{lang:'${langName}'}`);
  return (defaultRendererRulesFence || self.renderToken)(tokens, idx, options, env, self);
};

md.renderer.rules.blockquote_open = (
  /** @type {import('markdown-it/lib/token.mjs').default[]} */ tokens,
  /** @type {number} */ idx,
  /** @type {import('markdown-it').Options} */ options,
  /** @type {any} */ _env,
  /** @type {import('markdown-it/lib/renderer.mjs').default} */ self
) => {
  const token = tokens[idx];
  token.attrJoin('class', 'layui-elem-quote');
  token.attrJoin('class', 'layui-quote-nm');
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = (
  /** @type {import('markdown-it/lib/token.mjs').default[]} */ tokens,
  /** @type {number} */ idx,
  /** @type {import('markdown-it').Options} */ options,
  /** @type {any} */ _env,
  /** @type {import('markdown-it/lib/renderer.mjs').default} */ self
) => {
  const token = tokens[idx];
  token.attrSet('target', '_blank');
  token.attrSet('rel', 'noopener');
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.image = (
  /** @type {import('markdown-it/lib/token.mjs').default[]} */ tokens,
  /** @type {number} */ idx,
  /** @type {import('markdown-it').Options} */ options,
  /** @type {any} */ _env,
  /** @type {import('markdown-it/lib/renderer.mjs').default} */ self
) => {
  const token = tokens[idx];
  const srcIndex = token.attrIndex('src');
  if (srcIndex >= 0) {
    const src = token.attrs?.[srcIndex][1];
    token.attrSet('loading', 'lazy');
    if (src?.includes('hdslb.com'))
      token.attrSet('referrerpolicy', 'no-referrer');
  }
  return `<div lay-on="post-img">${self.renderToken(tokens, idx, options)}</div>`;
};

export function md2html(/** @type {string} */ text) {
  return md.render(text);
}
