import { readFileSync } from "node:fs"
import { resolve } from "path"
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

function localOllamaChatPlugin(): Plugin {
  return {
    name: "local-ollama-chat",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res, next) => {
        if (req.method !== "POST") {
          next()
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
        }

        let body: { messages?: Array<{ role?: string; content?: string }> }
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"))
        } catch {
          res.statusCode = 400
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ error: "Invalid JSON request body." }))
          return
        }

        const messages = Array.isArray(body?.messages)
          ? body.messages.filter(
              (m) =>
                (m?.role === "user" || m?.role === "assistant") &&
                typeof m?.content === "string" &&
                m.content.trim().length > 0,
            )
          : []

        if (messages.length === 0) {
          res.statusCode = 400
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ error: "Request must include a non-empty messages array." }))
          return
        }

        const resumeJson = readFileSync(
          resolve(__dirname, "docs/resume/resume.json"),
          "utf8",
        )
        const systemPrompt = [
          "You are Yoojin Choi's portfolio and resume assistant.",
          "Answer concisely, warmly, and clearly in a helpful tone.",
          "Use ONLY facts present in the resume JSON below.",
          "Never invent projects, companies, metrics, skills, or dates.",
          "If asked something not covered by the resume JSON, say so honestly and offer to reach Yoojin directly at ugn.choi@gmail.com or https://www.linkedin.com/in/ugnchoi.",
          "",
          "Resume JSON:",
          resumeJson,
        ].join("\n")

        try {
          const upstream = await fetch("http://127.0.0.1:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(15000),
            body: JSON.stringify({
              model: "qwen3:1.7b",
              stream: false,
              think: false,
              messages: [{ role: "system", content: systemPrompt }, ...messages],
            }),
          })

          if (!upstream.ok) {
            const detail = await upstream.text().catch(() => "")
            res.statusCode = 502
            res.setHeader("Content-Type", "application/json")
            res.end(
              JSON.stringify({
                error: detail
                  ? `Ollama error (${upstream.status}): ${detail.slice(0, 200)}`
                  : `Ollama error (${upstream.status}).`,
              }),
            )
            return
          }

          const data = (await upstream.json()) as { message?: { content?: string } }
          const reply = (data.message?.content ?? "")
            .replace(/<think>[\s\S]*?<\/think>/g, "")
            .trim()

          if (!reply) {
            res.statusCode = 502
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ error: "Ollama returned an empty response." }))
            return
          }

          res.statusCode = 200
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ reply }))
        } catch (err) {
          res.statusCode = 502
          res.setHeader("Content-Type", "application/json")
          res.end(
            JSON.stringify({
              error:
                err instanceof Error
                  ? `Unable to reach local Ollama: ${err.message}`
                  : "Unable to reach local Ollama.",
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), localOllamaChatPlugin()],
  build: {
    // Keep webfonts inside the generated CSS so static hosts do not need
    // to accept separate .woff2 files. The 210 KB headshot remains a PNG.
    assetsInlineLimit: 32 * 1024,
    rollupOptions: {
      input: {
        portfolio: resolve(__dirname, 'index.html'),
        water: resolve(__dirname, 'water/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
})
