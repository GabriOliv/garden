import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
	title: 'Garden',
	tagline: 'Uma Coleção de Notas em Evolução',
	favicon: 'img/favicon.ico',

	// Set the production url of your site here
	// url: 'https://your-docusaurus-site.example.com',
	url: 'https://gabrioliv.github.io/',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/garden/',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'gabrioliv', // Usually your GitHub org/user name.
	projectName: 'garden', // Usually your repo name.

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'pt-BR',
		locales: ['en'],
	},

	markdown: {
		mermaid: true,
	},
	themes: ['@docusaurus/theme-mermaid'],

	presets: [
		[
			'classic',
			{
				docs: {
					sidebarPath: './sidebars.ts',
					// path: 'docs',
					// routeBasePath: 'docs',
					// Remove this to remove the "edit this page" links.
					editUrl:
						// 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
						'https://github.com/GabriOliv/garden',
					remarkPlugins: [remarkMath],
					rehypePlugins: [rehypeKatex],
				},
				blog: false,
				// blog: {
				// 	showReadingTime: true,
				// 	feedOptions: {
				// 		type: ['rss', 'atom'],
				// 		xslt: true,
				// 	},
				// 	// Please change this to your repo.
				// 	// Remove this to remove the "edit this page" links.
				// 	editUrl:
				// 		'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
				// 	// Useful options to enforce blogging best practices
				// 	onInlineTags: 'warn',
				// 	onInlineAuthors: 'warn',
				// 	onUntruncatedBlogPosts: 'warn',
				// },
				theme: {
					customCss: './src/css/custom.css',
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		// Replace with your project's social card
		image: 'img/docusaurus-social-card.jpg',
		navbar: {
			title: 'Garden',
			// logo: {
			// 	alt: 'Logo',
			// 	src: 'img/logo.svg',
			// },
			items: [
				{
					type: 'docSidebar',
					sidebarId: 'istqb',
					position: 'left',
					label: 'ISTQB',
				},
				// {
				// 	to: '/blog',
				// 	label: 'Blog',
				// 	position: 'left'
				// },
				{
					href: 'https://github.com/GabriOliv/garden',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		footer: {
			style: 'dark',
			links: [
			// 	{
			// 		title: 'Docs',
			// 		items: [
			// 			{
			// 				label: 'Tutorial',
			// 				to: '/docs/intro',
			// 			},
			// 		],
			// 	},
			// 	{
			// 		title: 'Community',
			// 		items: [
			// 			{
			// 				label: 'Stack Overflow',
			// 				href: 'https://stackoverflow.com/questions/tagged/docusaurus',
			// 			},
			// 			{
			// 				label: 'Discord',
			// 				href: 'https://discordapp.com/invite/docusaurus',
			// 			},
			// 			{
			// 				label: 'Twitter',
			// 				href: 'https://twitter.com/docusaurus',
			// 			},
			// 		],
			// 	},
			// 	{
			// 		title: 'More',
			// 		items: [
			// 			{
			// 				label: 'Blog',
			// 				to: '/blog',
			// 			},
			// 			{
			// 				label: 'GitHub',
			// 				href: 'https://github.com/facebook/docusaurus',
			// 			},
			// 		],
			// 	},
			],
			// copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
			copyright: `Criado com Docusaurus e ❤️`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
		mermaid: {
				options: {
					theme: 'base',
				},
		},
	} satisfies Preset.ThemeConfig,
	stylesheets: [
		{
			href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
			type: 'text/css',
			integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
			crossorigin: 'anonymous',
		},
	],
};

export default config;