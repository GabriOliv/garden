# Garden

> Uma Coleção de Notas em Evolução.

Repositório para documentação sobre teste e qualidade de software em formato de digital garden.

[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.7.0-blue?logo=docusaurus&style=for-the-badge)](https://docusaurus.io/)
&nbsp;&nbsp;&nbsp;
[![CD Workflow](https://img.shields.io/github/actions/workflow/status/gabrioliv/garden/deploy.yml?style=for-the-badge&logo=github)](https://github.com/GabriOliv/garden/actions)
&nbsp;&nbsp;&nbsp;
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fgabrioliv.github.io%2Fgarden&style=for-the-badge&color=1b73ff)](https://gabrioliv.github.io/garden/)

---

## Instalando o Projeto

Clone o repositório:

```bash
git clone git@github.com:GabriOliv/garden.git
```

Entre na pasta do projeto:

```bash
cd garden
```

Instale as dependências:

```bash
npm install
```

Execute o projeto localmente:

```bash
npm start
```

## Build Local

Build do projeto:

```bash
npm run build
```

Server com build:

```bash
npm run serve
```

## Deploy Automático

O deploy é feito automaticamente pelo GitHub Actions, após a aprovação do Pull Request.

- Configuração necessária:
	- Adicionar `gh-pages` como branch de deploy.
	- Adicionar branch `main` como branch protegida.

Projeto será publicado na URL: `USERNAME.github.io/garden`

---
