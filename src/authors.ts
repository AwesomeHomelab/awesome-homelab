export const authors = ["baranwang", "fatwang2", "0tt0", "JasonChou0v0", "zxfccmm4", "bluenight91"].map(
  (name) => ({
    name,
    file: `${name}.webp`,
    url: `https://unavatar.webp.se/github/${name}`,
  }),
);

export function avatarPath(name: string): string | undefined {
  const author = authors.find((author) => author.name === name);
  return author ? `/avatars/${author.file}` : undefined;
}
