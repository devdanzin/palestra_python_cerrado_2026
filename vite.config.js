// Servidor de desenvolvimento dos slides: `npm start` serve apresentacao/
// em http://localhost:8000/cerrado.html e recarrega a página quando algo muda.
export default {
	root: 'apresentacao',
	server: { port: 8000 },
	plugins: [
		{
			// O Vite já recarrega a página quando o HTML muda, mas ignora o CSS
			// carregado via <link> (como dist/theme/black.css) e as imagens.
			name: 'recarregar-slides',
			configureServer(server) {
				server.watcher.on('change', (arquivo) => {
					if (!arquivo.endsWith('.html')) {
						server.ws.send({ type: 'full-reload' });
					}
				});
			},
		},
	],
};
