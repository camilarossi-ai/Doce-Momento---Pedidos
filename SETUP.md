# Doce Momento — colocando o site no ar (passo a passo)

## Parte 1 — Criar a planilha de relatório (5 min)

1. Crie uma planilha nova no Google Sheets.
2. No menu, vá em **Extensões → Apps Script**.
3. Apague o código de exemplo e cole o conteúdo do arquivo `apps-script.gs` (está aqui na pasta).
4. Clique em **Implantar → Nova implantação**.
5. No tipo, escolha **App da Web**.
6. Em "Executar como": **Eu (seu e-mail)**.
7. Em "Quem pode acessar": **Qualquer pessoa**.
8. Clique em **Implantar**, autorize as permissões pedidas.
9. Copie a **URL do app da Web** gerada (termina em `/exec`).
10. Abra `src/App.jsx`, encontre a linha `sheetWebhookUrl: ""` e cole a URL entre as aspas.

Pronto — a partir de agora, todo pedido enviado grava uma linha nessa planilha automaticamente.

## Parte 2 — Colocar o site no ar com Vercel (grátis)

**Sem usar linha de comando:**

1. Crie uma conta gratuita em https://github.com (se ainda não tiver).
2. Clique em **New repository**, dê um nome (ex: `doce-momento-pedidos`) e crie.
3. Na página do repositório, clique em **Add file → Upload files** e arraste TODOS os arquivos e pastas desta pasta (`package.json`, `index.html`, `src/`, etc.) — menos o `apps-script.gs` e este `SETUP.md`, que não precisam ir para o site.
4. Clique em **Commit changes**.
5. Crie uma conta gratuita em https://vercel.com, escolhendo "Continuar com GitHub".
6. Clique em **Add New → Project**, selecione o repositório que você acabou de criar.
7. A Vercel detecta sozinha que é um projeto Vite — não precisa mudar nada. Clique em **Deploy**.
8. Em cerca de 1 minuto, ela te dá um link tipo `doce-momento-pedidos.vercel.app` — esse é o site que você manda pra ela usar/divulgar.

## Depois de publicado

- Sempre que quiser mudar preço, sabor, número de WhatsApp ou região de entrega, edite as constantes no topo do arquivo `src/App.jsx` (bloco `CONFIG`), suba o arquivo atualizado no GitHub (mesmo botão de upload) — a Vercel republica sozinha em segundos.
- Quer um domínio próprio (ex: docemomento.com)? Dá pra comprar (~R$40/ano) e conectar direto nas configurações do projeto na Vercel.
