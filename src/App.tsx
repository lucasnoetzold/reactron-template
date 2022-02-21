import fs from 'fs'
import { markdown } from 'markdown'

const mdContent = fs.readFileSync('README.md', 'utf-8')
const htmlContent = markdown.toHTML(mdContent)

export default function () {
    return (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
}