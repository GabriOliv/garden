# 🌱 Garden

> Uma Coleção de Notas em Evolução.

Repositório de documentação sobre teste e qualidade de software em formato de digital garden. Este projeto utiliza Docusaurus para criar uma base de conhecimento interativa e organizada.

[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.9.2-blue?logo=docusaurus&style=for-the-badge)](https://docusaurus.io/)
&nbsp;&nbsp;
[![CD Workflow](https://img.shields.io/github/actions/workflow/status/gabrioliv/garden/deploy.yml?style=for-the-badge&logo=github)](https://github.com/GabriOliv/garden/actions)
&nbsp;&nbsp;
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fgabrioliv.github.io%2Fgarden&style=for-the-badge&color=1b73ff)](https://gabrioliv.github.io/garden/)
&nbsp;&nbsp;
[![License](https://img.shields.io/github/license/gabrioliv/garden?style=for-the-badge)](LICENSE)

[![Visit Site](https://img.shields.io/badge/Visit%20Site-gabrioliv.github.io%2Fgarden-brightgreen?style=for-the-badge&logo=github)](https://gabrioliv.github.io/garden/)
&nbsp;&nbsp;&nbsp;

---

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18.0
- npm ou yarn

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
git clone git@github.com:GabriOliv/garden.git
cd garden
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute em modo de desenvolvimento

```bash
npm start
```

O site estará disponível em `http://localhost:3000`

### Alternativa: Docker

```bash
docker compose up -d garden
```

O site fica em `http://localhost:3000/garden/`.

O container guarda o `node_modules` num volume próprio, separado do host. Quando a versão do `@gabrioliv/dossier` (ou de outra dependência) subir no `package.json`, recrie a imagem e o volume. Sem isso, o container continua com a versão antiga e componentes novos ou props novas não funcionam:

```bash
docker compose build garden
docker compose up -d --renew-anon-volumes garden
```

Para conferir a versão em uso no container:

```bash
docker compose exec garden grep '"version"' node_modules/@gabrioliv/dossier/package.json
```

## 🔨 Build e Deploy Local

### Build para produção

```bash
npm run build
```

### Servir build local

```bash
npm run serve
```

## 🚢 Deploy Automático

O deploy é realizado automaticamente via GitHub Actions após merge na branch `main`.

### Configuração necessária:

- ✅ Branch `gh-pages` configurada como fonte de deploy no GitHub Pages
- ✅ Branch `main` protegida e com permissão de deploy para a branch de GitHub Pages

**URL de publicação:** `USERNAME.github.io/garden`

---