export const authors = Object.entries({
  baranwang: 11427801,
  fatwang2: 134143178,
  "0tt0": 318468762,
  JasonChou0v0: 76592626,
  zxfccmm4: 17553115,
}).map(([name, id]) => ({
  name,
  file: `${name}.webp`,
  url: `https://avatars-githubusercontent.webp.se/u/${id}`,
}));

export function avatarPath(name: string): string | undefined {
  const author = authors.find((author) => author.name === name);
  return author ? `/avatars/${author.file}` : undefined;
}
