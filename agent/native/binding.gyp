# agent/native/binding.gyp — recipe do node-gyp para compilar sendinput.node.
#
# Uso:
#   cd agent
#   npx node-gyp rebuild --directory .
#
# Gera: build/Release/sendinput.node
#
# `sendinput.cjs` (ponte CJS na mesma pasta) detecta presença do .node e
# delega; se não houver, continua servindo de fallback (no-op).

{
  "targets": [
    {
      "target_name": "sendinput",
      "sources": [ "sendinput.cpp" ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
      "conditions": [
        [
          "OS=='win'",
          {
            "libraries": [ "user32.lib" ]
          }
        ],
        [
          "OS=='mac'",
          {
            "sources!": [ "sendinput.cpp" ]
          }
        ]
      ]
    }
  ]
}
