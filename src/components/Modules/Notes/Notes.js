"use client";

import { useEffect, useRef } from "react";
import { useSession, MODULE_SESSION_PREFIX } from "@/client_API_calls/session_storage/useSession";
import ModuleHeader from '../ModuleHeader.js/ModuleHeader'
import { MODULE_DEFINITIONS } from "@/module_definitions/module_definitions";
import DOMPurify from "dompurify";


import {
    Editor,
    EditorProvider,
    Toolbar,
    BtnBold,
    BtnItalic,
    BtnBulletList,
    BtnNumberedList,
    BtnUnderline,
    BtnClearFormatting
} from "react-simple-wysiwyg";

import "./Notes.css";

export default function Notes({ id, onRemove, onSettings }) {
    const [data, setData] = useSession(
        MODULE_SESSION_PREFIX + id,
        MODULE_DEFINITIONS.notes.defaultData
    );
    const notesRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (!notesRef.current?.contains(e.target)) {
                const activeElement = document.activeElement;
                // We don't have direct ref to the editable div
                if (activeElement?.isContentEditable) {
                    activeElement.blur();
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleChange(e){
        const sanitizedText = DOMPurify.sanitize(e.target.value);
        setData({ ...data, text: sanitizedText });
    }

    return (
        <div className="notes" ref={notesRef}>
            <ModuleHeader
            title={data.title}
            onTitleChange={(newTitle) => setData({ ...data, title: newTitle })}
            onRemove={() => onRemove(id)}
            onSettings={() => onSettings(id)}
            />
            <div
            className="notes-body"
            onMouseDownCapture={(e) => {
                const tag = e.target?.tagName?.toLowerCase();
                if (tag !== "button" && tag !== "svg" && tag !== "path") {
                e.stopPropagation();
                }
            }}
            >
            <EditorProvider>
                <Toolbar>
                <BtnBold />
                <BtnItalic />
                <BtnUnderline />
                <BtnBulletList />
                <BtnNumberedList />
                <BtnClearFormatting />
                </Toolbar>

                <Editor
                className="notes-textarea"
                value={DOMPurify.sanitize(data.text)}
                onChange={handleChange}
                placeholder="Write notes here..."
                />
            </EditorProvider>
            </div>
        </div>
    );
}
