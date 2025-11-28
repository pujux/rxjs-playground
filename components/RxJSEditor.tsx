import { loadRxjsTypes } from "@/lib/load-rxjs-types";
import { Editor } from "@monaco-editor/react";

export type RxJSEditorProps = {
  code: string;
  setCode: (code: string) => void;
};

export function RxJSEditor({ code, setCode }: RxJSEditorProps) {
  return (
    <Editor
      height="100%"
      language="javascript"
      value={code}
      onChange={(value) => setCode(value || "")}
      theme="vs-dark"
      beforeMount={async (monaco) => {
        const js = monaco.languages.typescript.javascriptDefaults;

        js.setCompilerOptions({
          allowNonTsExtensions: true,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          strict: false,
          noEmit: true,
        });

        js.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });

        js.addExtraLib(
          `
  declare const rxjs: typeof import('rxjs');
  `,
          "file:///rxjs-globals.d.ts"
        );

        js.addExtraLib(
          `
                /** 
                 * Used to visualize your Observable in the chart and event log. 
                 * 
                 * @param series - The name of the series to assign the value to
                 */ 
                declare function rxObserver(series?: string): Observer<any>;
                `,
          "file:///globals.d.ts"
        );

        await loadRxjsTypes(js);
      }}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
      }}
    />
  );
}
