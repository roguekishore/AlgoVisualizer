import {
    ArrowUp,
    CheckCircle,
    Clock,
    Code,
    GitBranch,
    Hash,
    Merge,
    Split
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- START: Helper Component (VisualizerPointer) ---

// Pointer Component 
const VisualizerPointer = ({
    nodeId,
    containerId,
    color,
    label,
    yOffset = 0,
}) => {
    const [position, setPosition] = useState({ opacity: 0, left: 0, top: 0 });

    useEffect(() => {
        // -99 is used as a consistent placeholder for the conceptual 'null' pointer
        if (nodeId === null || nodeId === -99) { 
            setPosition((p) => ({ ...p, opacity: 0 }));
            return;
        }
        const container = document.getElementById(containerId);
        const element = document.getElementById(`node-${nodeId}`);
        
        if (container && element) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const left =
                elementRect.left - containerRect.left + elementRect.width / 2 - 20;
            const top = elementRect.top - containerRect.top - 40 + yOffset;
            setPosition({ opacity: 1, left, top });
        } else {
            setPosition((p) => ({ ...p, opacity: 0 }));
        }
    }, [nodeId, containerId, yOffset]);

    const colorClasses = {
        amber: "text-orange",
        green: "text-success", // Will be used for 'swappedRest' pointer
        red: "text-danger",    // Will be used for 'second' pointer
        blue: "text-accent-primary",   // Will be used for 'head' pointer
        purple: "text-purple",
        cyan: "text-teal",
    };

    return (
        <div
            className="absolute text-center transition-all duration-300 ease-out pointer-events-none"
            style={position}
        >
            <div
                className={`font-bold text-lg font-mono ${colorClasses[color]} flex items-center gap-1`}
            >
                {label === "head" && <Hash size={20} />}
                {label === "second" && <Merge size={20} />}
                {label === "swappedRest" && <Split size={20} />}
                <span>{label}</span>
            </div>
            <ArrowUp className={`w-6 h-6 mx-auto ${colorClasses[color]}`} />
        </div>
    );
};

// --- END: Helper Component (VisualizerPointer) ---


// --- START: Recursive Swap Pairs Logic ---

const generateSwapPairsHistory = (initialNodes, setHistory, setCurrentStep) => {
    const newHistory = [];
    let stepCounter = 0;
    let nodes = initialNodes.map(n => ({ ...n })); 

    // Helper to find node by ID or return a placeholder
    const getNodeById = (id) => nodes.find(n => n.id === id);

    const addState = (props) => {
        // Deep clone nodes for the state history
        const currentStateNodes = nodes.map(n => ({...n}));
        
        newHistory.push({
            step: stepCounter++,
            explanation: "",
            nodes: currentStateNodes, 
            ...props,
        });
    };
    
    // Function to visually reorder nodes based on their IDs and current links
    const reorderNodesByPointers = (currentNodes, startNodeId) => {
        let currentNode = getNodeById(startNodeId);
        let orderedIds = [];
        let tempNodes = [...currentNodes]; // Working copy
        
        // Traverse the list by following the 'next' pointers
        while (currentNode) {
            orderedIds.push(currentNode.id);
            currentNode = getNodeById(currentNode.next);
        }

        // Filter the original array to match the new order of IDs
        const newOrderedNodes = orderedIds.map((id, index) => {
            const node = tempNodes.find(n => n.id === id);
            return {
                ...node,
                x: 80 + index * 140, // Update visual position based on index
                y: 200,
            };
        });

        // Replace the global mutable array with the visually sorted array
        nodes = newOrderedNodes;
    };


    // Main Recursive function
    const swapPairsRecursive = (headId, depth) => {
        const head = getNodeById(headId);
        const second = head && getNodeById(head.next);
        const nextPairHeadId = second ? second.next : null;
        
        // Base Case Check
        if (!head || !second) {
            addState({
                line: 2,
                explanation: `Base case reached: List is empty or single node (${head ? head.data : 'NULL'}). Returning head.`,
                head: headId, 
                second: null, 
                swappedRest: null,
                depth,
                returning: true,
            });
            return headId; // Returns the head of the sublist
        }

        // --- 1. Before Recursion (Calling Down) ---
        addState({
            line: 5,
            explanation: `Recursively calling swapPairs for the rest of the list starting at ${nextPairHeadId !== null ? getNodeById(nextPairHeadId)?.data : 'NULL'}.`,
            head: headId, 
            second: second.id, 
            swappedRest: nextPairHeadId,
            depth,
            recursionCall: true,
        });

        // RECURSIVE CALL
        const swappedRestHeadId = swapPairsRecursive(nextPairHeadId, depth + 1);

        // --- 2. After Recursion (Unwinding / Swapping Current Pair) ---
        
        // Pointer Manipulation (The core swap logic: lines 7 & 8)
        second.next = headId;      // Line 7: Second node now points to the first node
        head.next = swappedRestHeadId; // Line 8: First node points to the returned (swapped) rest of the list

        // Reorder for visualization (this is crucial for showing the link changes immediately)
        reorderNodesByPointers(nodes, second.id); // Start traversal from the new local head: 'second'

        addState({
            line: 9,
            explanation: `Pointers for (${head.data}, ${second.data}) swapped. The new local head is ${second.data}. Returning this head up the stack.`,
            head: headId, 
            second: second.id, 
            swappedRest: swappedRestHeadId,
            depth,
            returning: true,
            swapped: true,
        });

        // Returns the new head of the swapped pair (the original 'second' node)
        return second.id; 
    };

    // --- Start Execution ---
    const initialHeadId = nodes[0]?.id || null;
    const finalHeadId = swapPairsRecursive(initialHeadId, 0);

    // --- 3. Final State ---
    
    // Perform a final reorder based on the absolute final linked list state starting from the new head
    reorderNodesByPointers(nodes, finalHeadId);

    addState({
        line: 10,
        explanation: "Recursion finished! The final list is now fully swapped.",
        nodes: nodes.map(n => ({...n})), // Final nodes with correct pointers and positions
        head: finalHeadId,
        second: null,
        swappedRest: null,
        depth: 0,
        finished: true,
    });

    setHistory(newHistory);
    setCurrentStep(0);
};

// --- END: Recursive Swap Pairs Logic ---


// --- START: Main Component (SwapPairs) ---

const SwapPairs = () => {
    // Note: useModeHistorySwitch is not functional here as this is a standalone component, 
    // but the import remains as requested.
    // We will just manage history manually.
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [listInput, setListInput] = useState("1,2,3,4,5");
    const [isLoaded, setIsLoaded] = useState(false);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [mode, setMode] = useState("swap-pairs-recursive"); // Set a default mode

    const buildAndGenerateHistory = () => {
        const data = listInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map(Number);

        if (data.some(isNaN) || data.length === 0) {
            alert("Invalid list input. Please use comma-separated numbers.");
            return;
        }

        const newNodes = data.map((d, i) => ({
            id: i,
            data: d,
            next: i + 1 < data.length ? i + 1 : null,
            x: 80 + i * 140,
            y: 200,
        }));

        setNodes(newNodes);
        generateSwapPairsHistory(newNodes, setHistory, setCurrentStep);
        setIsLoaded(true);
    };

    const stepForward = useCallback(
        () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
        [history.length]
    );
    const stepBackward = useCallback(
        () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
        []
    );

    const reset = () => {
        setIsLoaded(false);
        setHistory([]);
        setCurrentStep(-1);
        setNodes([]);
        setEdges([]);
        setListInput("1,2,3,4,5");
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isLoaded) {
                if (e.key === "ArrowLeft") stepBackward();
                if (e.key === "ArrowRight") stepForward();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLoaded, stepForward, stepBackward]);

    const state = history[currentStep] || {};

    const colorMapping = {
        purple: "text-purple",
        cyan: "text-teal",
        "light-blue": "text-accent-primary300",
        yellow: "text-warning",
        orange: "text-orange",
        red: "text-danger",
        "light-gray": "text-theme-muted",
        green: "text-success",
        "": "text-theme-secondary",
    };

    const CodeLine = ({ line, content }) => (
        <div
            className={`block rounded-md transition-colors px-2 py-1 ${
                state.line === line ? "bg-accent-primary-light border-l-4 border-accent-primary" : ""
            }`}
        >
            <span className="text-theme-muted w-8 inline-block text-right pr-4 select-none">
                {line}
            </span>
            {content.map((token, index) => (
                <span key={index} className={colorMapping[token.c]}>
                    {token.t}
                </span>
            ))}
        </div>
    );

    // Recursive C++ Pseudocode
    const swapPairsCode = [
        {
            l: 1,
            c: [
                { t: "ListNode*", c: "cyan" },
                { t: " swapPairs(", c: "" },
                { t: "ListNode*", c: "cyan" },
                { t: " head) {", c: "" },
            ],
        },
        {
            l: 2,
            c: [
                { t: "  if", c: "purple" },
                { t: " (!head || !head->next) ", c: "" },
                { t: "return", c: "purple" },
                { t: " head;", c: "" },
            ],
        },
        { l: 3, c: [{ t: "", c: "" }] },
        {
            l: 4,
            c: [
                { t: "  ", c: "" },
                { t: "ListNode*", c: "cyan" },
                { t: " second = head->next;", c: "red" },
            ],
        },
        {
            l: 5,
            c: [
                { t: "  ", c: "" },
                { t: "ListNode*", c: "cyan" },
                { t: " swappedRest = swapPairs(second->next);", c: "green" },
            ],
        },
        { l: 6, c: [{ t: "", c: "" }] },
        {
            l: 7,
            c: [
                { t: "  second->next = head;", c: "" },
            ],
        },
        {
            l: 8,
            c: [
                { t: "  head->next = swappedRest;", c: "" },
            ],
        },
        {
            l: 9,
            c: [
                { t: "  return", c: "purple" },
                { t: " second; // New head of this pair", c: "" },
            ],
        },
        {
            l: 10,
            c: [
                { t: "}", c: "light-gray" },
            ],
        },
    ];

    // Recalculate edges based on the current step's node pointers
    const currentEdges = [];
    if (state.nodes && state.nodes.length > 0) {
        state.nodes.forEach((node) => {
            if (node.next !== null && node.next !== -99) { // -99 is internal representation of null pointer
                const nextNodeExists = state.nodes.some(n => n.id === node.next);
                if (nextNodeExists) {
                    currentEdges.push({ from: node.id, to: node.next, isCycle: false });
                }
            }
        });
    }

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-accent-primary400 to-accent-primary500 bg-clip-text text-transparent">
                    Linked List Swap Nodes in Pairs
                </h1>
                <p className="text-xl text-theme-tertiary mt-3">Visualizing Swapping Nodes In Pairs Algorithms on Linked Lists</p>
            </header>

            <div className="bg-theme-tertiary p-5 rounded-xl shadow-2xl border border-theme-primary mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow w-full">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <label className="font-mono text-sm text-theme-secondary whitespace-nowrap">
                                List Values:
                            </label>
                            <input
                                type="text"
                                value={listInput}
                                onChange={(e) => setListInput(e.target.value)}
                                disabled={isLoaded}
                                className="font-mono flex-grow sm:w-48 bg-theme-secondary p-2 rounded-lg border-2 border-theme-primary focus:border-accent-primary focus:outline-none transition-colors"
                                placeholder="e.g., 1,2,3,4,5"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isLoaded ? (
                            <button
                                onClick={buildAndGenerateHistory}
                                className="bg-gradient-to-r from-purple500 to-pink600 cursor-pointer hover:from-purple600 hover:to-pink700 text-theme-primary font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                            >
                                Load & Visualize
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={stepBackward}
                                    disabled={currentStep <= 0}
                                    className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                                    </svg>
                                </button>
                                <span className="font-mono text-lg w-28 text-center bg-theme-elevated px-3 py-2 rounded-lg">
                                    {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                                </span>
                                <button
                                    onClick={stepForward}
                                    disabled={currentStep >= history.length - 1}
                                    className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                                    </svg>
                                </button>
                            </>
                        )}
                        <button
                            onClick={reset}
                            className="bg-danger-hover hover:bg-danger-hover font-bold py-3 cursor-pointer px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {isLoaded ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Code Panel */}
                    <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-theme-primary">
                        <h3 className="font-bold text-2xl text-purple mb-4 pb-3 border-b border-theme-primary flex items-center gap-2">
                            <Code size={22} />
                            C++ Solution
                        </h3>
                        <pre className="text-sm overflow-auto max-h-96">
                            <code className="font-mono leading-relaxed">
                                {swapPairsCode.map((line) => (
                                    <CodeLine key={line.l} line={line.l} content={line.c} />
                                ))}
                            </code>
                        </pre>
                    </div>

                    {/* Visualization & Explanation */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Visualization Area */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-theme-primary shadow-2xl min-h-[360px] overflow-x-auto">
                            <h3 className="font-bold text-xl text-theme-secondary mb-4 flex items-center gap-2">
                                <GitBranch size={22} />
                                Linked List Visualization (Depth: **{state.depth || 0}**) 
                            </h3>
                            <div
                                className="relative"
                                id="linked-list-container" // Set ID here for pointer component
                                style={{
                                    height: "280px",
                                    width: `${Math.max(nodes.length, state.nodes?.length || 0) * 140 + 100}px`,
                                }}
                            >
                                <svg
                                    id="linked-list-svg"
                                    className="w-full h-full absolute top-0 left-0"
                                >
                                    <defs>
                                        <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#60a5fa" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                                        </marker>
                                    </defs>
                                    
                                    {/* Edges (Lines) */}
                                    {currentEdges.map((edge, i) => {
                                        const fromNode = state.nodes?.find((n) => n.id === edge.from);
                                        const toNode = state.nodes?.find((n) => n.id === edge.to);
                                        if (!fromNode || !toNode) return null;

                                        return (
                                            <line
                                                key={i}
                                                x1={fromNode.x + 100}
                                                y1={fromNode.y}
                                                x2={toNode.x}
                                                y2={toNode.y}
                                                stroke="url(#arrow-gradient)"
                                                strokeWidth="3"
                                                markerEnd="url(#arrow)"
                                                className="drop-shadow-md"
                                            />
                                        );
                                    })}
                                </svg>
                                <div className="absolute top-0 left-0 w-full h-full">
                                    {/* Nodes (Boxes) */}
                                    {state.nodes?.map((node, index) => {
                                        const isHead = state.head === node.id;
                                        const isSecond = state.second === node.id;
                                        const isRest = state.swappedRest === node.id;

                                        const isActive = isHead || isSecond || isRest;
                                        
                                        let baseClasses = "bg-gradient-to-br from-theme-tertiary to-theme-elevated border-2 border-theme-muted";
                                        if (isActive) {
                                            if (isHead) baseClasses = "bg-gradient-to-br from-accent-primary500 to-accent-primary600 border-3 border-accent-primary300 scale-110";
                                            else if (isSecond) baseClasses = "bg-gradient-to-br from-danger500 to-pink600 border-3 border-danger300 scale-110";
                                            else if (isRest) baseClasses = "bg-gradient-to-br from-success500 to-success-hover border-3 border-success300 scale-110";
                                        }

                                        return (
                                            <div
                                                key={node.id}
                                                id={`node-${node.id}`}
                                                className={`absolute w-24 h-14 flex items-center justify-center rounded-xl font-mono text-xl text-theme-primary font-bold transition-all duration-500 shadow-xl ${baseClasses} ${state.finished ? "animate-pulse" : ""}`}
                                                style={{
                                                    left: `${node.x}px`,
                                                    top: `${node.y - 28}px`,
                                                    transition: "left 0.5s ease-in-out, top 0.5s ease-in-out"
                                                }}
                                            >
                                                {node.data}
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Pointers */}
                                    <VisualizerPointer
                                        nodeId={state.head}
                                        containerId="linked-list-container"
                                        color="blue"
                                        label="head"
                                        yOffset={-30}
                                    />
                                    <VisualizerPointer
                                        nodeId={state.second}
                                        containerId="linked-list-container"
                                        color="red"
                                        label="second"
                                        yOffset={0}
                                    />
                                    <VisualizerPointer
                                        nodeId={state.swappedRest}
                                        containerId="linked-list-container"
                                        color="green"
                                        label="swappedRest"
                                        yOffset={30}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Status and Explanation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                className={`p-5 rounded-2xl border-2 transition-all shadow-xl ${state.finished
                                        ? "bg-gradient-to-br from-success900/40 to-success900/40 border-success"
                                        : state.recursionCall 
                                            ? "bg-gradient-to-br from-purple900/40 to-accent-primary900/40 border-purple"
                                            : state.returning
                                                ? "bg-gradient-to-br from-warning900/40 to-orange900/40 border-warning"
                                                : "bg-gradient-to-br from-gray-800 to-gray-850 border-theme-primary"
                                    }`}
                            >
                                <h3
                                    className={`text-sm font-semibold flex items-center gap-2 mb-2 ${state.finished ? "text-success" : "text-theme-tertiary"}`}
                                >
                                    <CheckCircle size={18} />
                                    Process Status
                                </h3>
                                <p
                                    className={`font-mono text-4xl font-bold ${state.finished ? "text-success" : "text-theme-tertiary"}`}
                                >
                                    {state.finished ? "✓ Completed" : (state.returning ? "↩️ Unwinding/Swapping" : "⬇️ Recursing Down")}
                                </p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-theme-primary shadow-xl">
                                <h3 className="text-theme-tertiary text-sm font-semibold mb-2">
                                    Step Explanation
                                </h3>
                                <p className="text-theme-secondary text-base leading-relaxed">
                                    {state.explanation || 'Click "Load & Visualize" to begin the recursive swap process. Watch the stack depth change!'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Complexity Analysis */}
                    <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-theme-primary">
                        <h3 className="font-bold text-2xl text-purple mb-5 pb-3 border-b-2 border-theme-primary flex items-center gap-2">
                            <Clock size={24} />
                            Complexity Analysis
                        </h3>
                        <div className="space-y-5 text-base">
                            <div className="bg-theme-secondary/50 p-4 rounded-xl">
                                <h4 className="font-semibold text-purple text-lg mb-2">
                                    Time Complexity:{" "}
                                    <span className="font-mono text-teal300">$O(N)$</span>
                                </h4>
                                <p className="text-theme-secondary">
                                    Each pair of nodes is visited exactly once, once during the recursion descent (Line 5) and once during the unwind phase for swapping (Lines 7-8). This makes the time complexity linear with the number of nodes, $N$.
                                </p>
                            </div>
                            <div className="bg-theme-secondary/50 p-4 rounded-xl">
                                <h4 className="font-semibold text-purple text-lg mb-2">
                                    Space Complexity:{" "}
                                    <span className="font-mono text-teal300">$O(N)$</span>
                                </h4>
                                <p className="text-theme-secondary">
                                    The recursion utilizes the **call stack** to save the state of each active call. Since the depth of the stack is proportional to the number of pairs (roughly $N/2$ calls), the space complexity is $O(N)$.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="text-center py-12 bg-theme-tertiary rounded-xl border border-theme-primary">
                    <p className="text-theme-muted text-lg">
                        Enter a comma-separated list of numbers (e.g., $\textbf{1,2,3,4,5}$) and click "Load & Visualize" to see how the swap process unfolds.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SwapPairs;