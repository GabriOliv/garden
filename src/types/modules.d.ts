// Tipos de módulos que o Docusaurus carrega e que `@docusaurus/module-type-aliases` não declara.

declare module "*.mdx" {
  export const frontMatter: { readonly [key: string]: unknown };
}

declare module "*.webp" {
  const src: string;
  export default src;
}
