# Local model fast decisions

A [COGNIX[WS]](https://cognix.ws) extension that answers the helper model's
questions — which element of a page or a window matches what an agent
described, and yes/no questions about it — with a model running on this
computer. Nothing leaves the computer.

## What you need

- A model server on this computer that speaks the OpenAI API with JSON
  schema output and log probabilities: llama.cpp's `llama-server`
  (recommended), Ollama or LM Studio.
- A small instruct model. Measured 2026-10-21 with Qwen3-4B-Instruct-2507
  (Q4_K_M) on an RTX 4060 laptop GPU: 32 of 35 "find the element" tasks
  right, every absent target answered "nothing matches", 1.4–2.7 s per find
  and about 70 ms per yes/no on a page already read. On a CPU alone the first
  question on a new page took 27–43 s, too slow to be useful.

```bash
llama-server -m Qwen3-4B-Instruct-2507-Q4_K_M.gguf -ngl 99 -c 32768 --port 8080
```

## Install

In COGNIX[WS]: Settings ▸ Helper model ▸ Add a provider ▸ Local model, or
Extensions ▸ Install from a link with this repository's address. Then set
its Model server on the extension's page and choose it in Settings ▸ Helper
model.

## Its answers are advice

A local model's confidence does not tell a right answer from a wrong one:
measured, wrong answers came with the same confidence as right ones (0.999).
So this provider declares its answers advice (`decisions.advice`): agents
get `find` and `check`, and they act on the ref they found themselves. A
click on a described element, `run` and `snapshot {goal}` are not offered.

## Settings

| Setting | What it is |
|---|---|
| Model server | The OpenAI-compatible address, on this computer only: `http://127.0.0.1:8080/v1` (llama.cpp), `http://127.0.0.1:11434/v1` (Ollama), `http://127.0.0.1:1234/v1` (LM Studio). Any other host is refused. |
| Model | The model's name, when the server serves more than one (Ollama needs it). |

## How it works

`server.mjs` (no dependencies) serves two paths behind COGNIX[WS]'s process
relay. `POST /decide` asks the model server one question at a time: a choice
as JSON constrained to the offered options (its confidence is the
probability of the chosen tokens), a yes/no from the probabilities of the
first token, a score from the probabilities of the level digits. A request
past the model's context answers 413, and COGNIX[WS] asks again with less of
the page. `GET /status` says `ready`, `needs-setup` (a server that is not on
this computer) or `needs-attention` (the server does not answer).
COGNIX[WS] checks every answer before a tool uses it.

## License

Apache-2.0
