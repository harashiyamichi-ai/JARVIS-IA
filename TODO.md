# TODO

- [x] Criar endpoint backend do Vercel para responder `POST /api/chat`
  - [x] Implementar validação de método (apenas POST)
  - [x] Ler `process.env.GROQ_API_KEY`
  - [x] Chamar Groq `https://api.groq.com/openai/v1/chat/completions`
  - [x] Retornar `{ resposta }` no formato esperado pelo `script.js`
- [x] Ajustar `script.js` para remover qualquer API key hardcoded
- [x] Garantir que o front trata erro quando `data.resposta` vier vazio
- [ ] Testar fluxo completo: microfone -> `processCommand()` -> `/api/chat` -> resposta -> `speak()`


