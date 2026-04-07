import React, { useRef, useEffect, useCallback } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, rectangularSelection } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches, search } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { oneDark } from '@codemirror/theme-one-dark';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import type { Language } from '../../types';

interface CodeEditorProps {
    content: string;
    language: Language | null;
    theme: 'dark' | 'light';
    onChange?: (content: string) => void;
    readOnly?: boolean;
}

const languageCompartment = new Compartment();
const themeCompartment = new Compartment();
const readOnlyCompartment = new Compartment();

function getLanguageExtension(lang: Language | null) {
    switch (lang) {
        case 'cpp': return cpp();
        case 'python': return python();
        case 'java': return java();
        default: return [];
    }
}

// Light theme styling
const lightTheme = EditorView.theme({
    '&': {
        backgroundColor: '#ffffff',
        color: '#334155',
    },
    '.cm-content': {
        caretColor: '#334155',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '14px',
        lineHeight: '1.7',
    },
    '.cm-cursor': {
        borderLeftColor: '#334155',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
        backgroundColor: '#c7d2fe !important',
    },
    '.cm-gutters': {
        backgroundColor: '#f8fafc',
        color: '#94a3b8',
        border: 'none',
        borderRight: '1px solid #e2e8f0',
    },
    '.cm-activeLineGutter': {
        backgroundColor: '#f1f5f9',
        color: '#475569',
    },
    '.cm-activeLine': {
        backgroundColor: '#f8fafc',
    },
    '.cm-foldGutter .cm-gutterElement': {
        color: '#94a3b8',
    },
    '.cm-matchingBracket': {
        backgroundColor: '#ddd6fe',
        outline: 'none',
    },
    '.cm-searchMatch': {
        backgroundColor: '#fef08a',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: '#fdba74',
    },
    '.cm-panels': {
        backgroundColor: '#f1f5f9',
        color: '#334155',
        borderBottom: '1px solid #e2e8f0',
    },
    '.cm-panels input, .cm-panels button': {
        fontFamily: '"Inter", sans-serif',
    },
    '.cm-panel.cm-search input': {
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        padding: '2px 6px',
    },
    '.cm-panel.cm-search button': {
        backgroundColor: '#e2e8f0',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        padding: '2px 8px',
    },
});

// Dark theme overrides (on top of oneDark)
const darkThemeOverride = EditorView.theme({
    '.cm-content': {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '14px',
        lineHeight: '1.7',
    },
    '.cm-gutters': {
        border: 'none',
        borderRight: '1px solid #27272a',
    },
    '.cm-panels': {
        borderBottom: '1px solid #27272a',
    },
});

const CodeEditor: React.FC<CodeEditorProps> = ({
    content,
    language,
    theme,
    onChange,
    readOnly = false,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Create the editor on mount
    useEffect(() => {
        if (!containerRef.current) return;

        const isDark = theme === 'dark';

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged && onChangeRef.current) {
                onChangeRef.current(update.state.doc.toString());
            }
        });

        const state = EditorState.create({
            doc: content,
            extensions: [
                lineNumbers(),
                highlightActiveLineGutter(),
                history(),
                foldGutter(),
                drawSelection(),
                rectangularSelection(),
                indentOnInput(),
                bracketMatching(),
                closeBrackets(),
                highlightActiveLine(),
                highlightSelectionMatches(),
                search({ top: true }),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                languageCompartment.of(getLanguageExtension(language)),
                themeCompartment.of(isDark ? [oneDark, darkThemeOverride] : lightTheme),
                readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
                keymap.of([
                    ...defaultKeymap,
                    ...historyKeymap,
                    ...foldKeymap,
                    ...searchKeymap,
                    ...closeBracketsKeymap,
                    indentWithTab,
                ]),
                updateListener,
                EditorView.lineWrapping,
            ],
        });

        const view = new EditorView({
            state,
            parent: containerRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
        // Only re-create on mount (content is initial value)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update content when it changes from outside (e.g. switching files)
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        const currentContent = view.state.doc.toString();
        if (currentContent !== content) {
            view.dispatch({
                changes: {
                    from: 0,
                    to: currentContent.length,
                    insert: content,
                },
            });
        }
    }, [content]);

    // Update language when it changes
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        view.dispatch({
            effects: languageCompartment.reconfigure(getLanguageExtension(language)),
        });
    }, [language]);

    // Update theme when it changes
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        const isDark = theme === 'dark';
        view.dispatch({
            effects: themeCompartment.reconfigure(
                isDark ? [oneDark, darkThemeOverride] : lightTheme,
            ),
        });
    }, [theme]);

    // Update readOnly when it changes
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        view.dispatch({
            effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly)),
        });
    }, [readOnly]);

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-auto [&_.cm-editor]:h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:overflow-auto"
        />
    );
};

export default CodeEditor;
