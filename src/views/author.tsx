import { css, cx } from "../../styled-system/css";
import { avatarPath } from "../authors.ts";

export function Author({ name }: { name: string }) {
  const avatar = avatarPath(name);
  return (
    <span
      className={cx(
        "author",
        css({
          display: "inline-flex",
          alignItems: "center",
          gap: "1.5",
          minWidth: "0",
          verticalAlign: "middle",
          "& a": { textDecoration: "none", _hover: { textDecoration: "underline" } },
        }),
      )}
    >
      {avatar && (
        <img
          className={css({ flexShrink: "0", width: "6", height: "6", rounded: "full" })}
          src={avatar}
          alt=""
          width={24}
          height={24}
          loading="lazy"
          decoding="async"
        />
      )}
      <a href={`https://github.com/${encodeURIComponent(name)}`}>{name}</a>
    </span>
  );
}
