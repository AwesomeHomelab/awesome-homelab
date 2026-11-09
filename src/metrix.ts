export function registryLink(registryURL: string): string {
  const link = new URL("metrixbar://registry/add");
  link.searchParams.set("url", registryURL);
  return link.href;
}

export function installLink(id: string, registryURL: string): string {
  const link = new URL(`metrixbar://install/${encodeURIComponent(id)}`);
  link.searchParams.set("registry_url", registryURL);
  return link.href;
}
