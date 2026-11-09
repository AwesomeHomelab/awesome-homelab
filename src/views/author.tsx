import { avatarPath } from "../authors.ts";

export function Author({ name }: { name: string }) {
  const avatar = avatarPath(name);
  return (
    <span className="author">
      {avatar && <img src={avatar} alt="" width={24} height={24} loading="lazy" decoding="async" />}
      <a href={`https://github.com/${encodeURIComponent(name)}`}>{name}</a>
    </span>
  );
}
