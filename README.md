# palestra_python_cerrado_2026

Repositório privativo para desenvolvimento da palestra ["Quebrando o seu código e o Python"](https://pythoncerrado.org/2026/grade/20261107/quebrando-o-seu-codigo-e-o-python-JZP83A), apresentada na Python Cerrado 2026 (7 de novembro de 2026).

## Conteúdo

- `roteiro.md` — roteiro da palestra (versão de trabalho).
- `rascunho.md` — rascunho e anotações.
- `apresentacao/` — slides em [reveal.js](https://revealjs.com/): `cerrado.html`, os arquivos do reveal.js em `dist/` e as imagens em `images/`.

## Slides

Para servir os slides localmente, recarregando a página sempre que um arquivo em `apresentacao/` mudar:

```bash
npm install   # só na primeira vez
npm start     # http://localhost:8000/cerrado.html
```

Para usar outra porta: `npm start -- --port 9000`.

O deck tem dois temas. O escuro é o padrão; o claro é ativado pela URL: http://localhost:8000/cerrado.html?tema=claro. As cores do tema claro ficam em `apresentacao/dist/theme/claro.css`.
