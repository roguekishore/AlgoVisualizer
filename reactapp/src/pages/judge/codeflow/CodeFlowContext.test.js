import { renderToStaticMarkup } from "react-dom/server";
import { CodeFlowProvider, useCodeFlowContext } from "./CodeFlowContext";

function Probe({ onValue }) {
  const ctx = useCodeFlowContext();
  onValue(ctx);
  return null;
}

describe("CodeFlowContext", () => {
  test("provider exposes hovered (null default), setHovered, and sourceMap", () => {
    let captured = null;
    const sourceMap = { 1: ["b0"], 2: ["b0", "b1"] };

    renderToStaticMarkup(
      <CodeFlowProvider sourceMap={sourceMap}>
        <Probe onValue={(ctx) => { captured = ctx; }} />
      </CodeFlowProvider>,
    );

    expect(captured.hovered).toBeNull();
    expect(typeof captured.setHovered).toBe("function");
    expect(captured.sourceMap).toEqual(sourceMap);
  });

  test("defaults sourceMap to an empty object when not provided", () => {
    let captured = null;

    renderToStaticMarkup(
      <CodeFlowProvider>
        <Probe onValue={(ctx) => { captured = ctx; }} />
      </CodeFlowProvider>,
    );

    expect(captured.sourceMap).toEqual({});
    expect(captured.hovered).toBeNull();
  });
});
