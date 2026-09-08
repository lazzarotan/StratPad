import { EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnBulletList, BtnNumberedList, BtnClearFormatting, Editor } from "react-simple-wysiwyg"
import {Grid} from "@mui/material"
import DOMPurify from "dompurify";



interface SingleColumnEditorProps{
    text: string;
    onChange: (text: string) => void;
}
export default function SingleColumnEditor({ text, onChange }: SingleColumnEditorProps){

    function handleChange(e){
        const sanitizedText = DOMPurify.sanitize(e.target.value);
        onChange(sanitizedText);
    }

    return (
            <Grid size={12}>
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
                value={text}
                onChange={handleChange}
                placeholder="Write notes here..."
                />
            </EditorProvider> 
            </Grid>
    )
}