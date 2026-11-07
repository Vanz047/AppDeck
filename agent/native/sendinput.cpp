// agent/native/sendinput.cpp — add-on N-API que chama a Win32 `SendInput`.
//
// Expor apenas o que o `keyboard.ts` precisa: `sendInput(inputs, count,
// cbSize) -> number`, onde cada input é `{ scan, up, flags }` e `flags` já
// carrega `KEYEVENTF_SCANCODE` | `KEYEVENTF_KEYUP`. Assim a camada Node
// continua dona da semântica (scan codes, timing); aqui só faz a chamada
// de sistema.
//
// Compilar com `node-gyp` (ver `binding.gyp` na pasta):
//   npx node-gyp rebuild --directory agent
// Gera `build/Release/sendinput.node`; o `keyboard.ts` o copia/carrega de
// lá (o stub `sendinput.js` continua servindo de fallback quando o binário
// não existe).

#include <napi.h>

#ifdef _WIN32
#  include <windows.h>
#endif

namespace {

// Emulador de teclas (N-API).
class SendInputAddon : public Napi::ObjectWrap<SendInputAddon> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object target) {
    SendInputAddon addon = Napi::ObjectWrap<SendInputAddon>::New(env);
    addon.Set("sendInput", Napi::Function::From(
        env, [](const Napi::CallbackInfo &info) {
          Napi::Env env = info.Env();
          if (info.Length() < 3) {
            return Napi::Number::New(env, 0);
          }
          auto arr = info[0].As<Napi::Array>();
          int count = info[1].As<Napi::Number>().Int32Value();
          int cbSize = info[2].As<Napi::Number>().Int32Value();

#ifdef _WIN32
          std::vector<INPUT> inputs(count);
          for (int i = 0; i < count; i++) {
            auto obj = arr[i].As<Napi::Object>();
            auto scan = obj.Get("scan").As<Napi::Number>().Uint32Value();
            auto up = obj.Get("up").As<Napi::Boolean>().Value();
            auto flags = obj.Get("flags").As<Napi::Number>().Uint32Value();

            INPUT in;
            memset(&in, 0, sizeof(INPUT));
            in.type = INPUT_KEYBOARD;
            in.ki.wScan = static_cast<WORD>(scan);
            in.ki.dwFlags = static_cast<DWORD>(flags);
            // `wVk` não é usado (KEYEVENTF_SCANCODE set) — mas preencher
            // com 0 evita lixo em builds de debug.
            in.ki.wVk = 0;
            inputs[i] = in;

            // cbSize: Windows exige sizeof(INPUT) (80 em x64). O chamador
            // já envia o valor, mas garantimos o mínimo do SO pra caso
            // ele passe algo estranho (ex.: o stub JS não chama, mas
            // node-gyp compilando em 32 bits teria sizeof 40).
            if (cbSize < static_cast<int>(sizeof(INPUT))) {
              cbSize = static_cast<int>(sizeof(INPUT));
            }
          }
          UINT sent = SendInput(
              static_cast<UINT>(count), inputs.data(), static_cast<INT>(sizeof(INPUT)));
          return Napi::Number::New(env, static_cast<int>(sent));
#else
          // Não-windows: apenas reportar que nada foi inserido.
          (void)cbSize;
          return Napi::Number::New(env, 0);
#endif
        }, "sendInput"));

    target.Set(Napi::String::New(env, "name"), Napi::String::New(env, "sendinput"));
    target.Set(Napi::String::New(env, "platform"),
#ifdef _WIN32
               Napi::String::New(env, "win32")
#else
               Napi::String::New(env, "unsupported")
#endif
    );
    return target;
  }
};

NAPI_MODULE(NODE_GYP_MODULE_NAME, SendInputAddon::Init)

} // namespace
