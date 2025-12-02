"""
Convert DOCUMENTATION.md to PDF using markdown2 and weasyprint
"""
import os
from pathlib import Path

try:
    # Try importing required libraries
    import markdown2
    from weasyprint import HTML, CSS
    print("✓ Libraries imported successfully")
except ImportError as e:
    print(f"✗ Missing library: {e}")
    print("\nInstalling required libraries...")
    os.system("pip install markdown2 weasyprint")
    import markdown2
    from weasyprint import HTML, CSS
    print("✓ Libraries installed and imported")

# Paths
base_dir = Path(__file__).parent.parent
md_file = base_dir / "DOCUMENTATION.md"
pdf_file = base_dir / "SkillSeeker_v2_Documentation.pdf"

print(f"\nReading markdown file: {md_file}")
with open(md_file, 'r', encoding='utf-8') as f:
    md_content = f.read()

print("Converting markdown to HTML...")
html_content = markdown2.markdown(
    md_content,
    extras=[
        'fenced-code-blocks',
        'tables',
        'header-ids',
        'toc',
        'code-friendly',
        'break-on-newline'
    ]
)

# Add CSS styling
css_style = """
<style>
    @page {
        size: A4;
        margin: 2cm;
        @bottom-right {
            content: "Page " counter(page) " of " counter(pages);
            font-size: 9pt;
            color: #666;
        }
    }
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        font-size: 11pt;
    }
    h1 {
        color: #2c3e50;
        border-bottom: 3px solid #3498db;
        padding-bottom: 10px;
        margin-top: 30px;
        page-break-before: always;
    }
    h1:first-of-type {
        page-break-before: avoid;
    }
    h2 {
        color: #34495e;
        border-bottom: 2px solid #95a5a6;
        padding-bottom: 5px;
        margin-top: 25px;
    }
    h3 {
        color: #7f8c8d;
        margin-top: 20px;
    }
    code {
        background-color: #f4f4f4;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 10pt;
    }
    pre {
        background-color: #f8f8f8;
        border: 1px solid #ddd;
        border-left: 4px solid #3498db;
        padding: 15px;
        overflow-x: auto;
        border-radius: 4px;
        page-break-inside: avoid;
    }
    pre code {
        background-color: transparent;
        padding: 0;
    }
    table {
        border-collapse: collapse;
        width: 100%;
        margin: 20px 0;
        page-break-inside: avoid;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
    }
    th {
        background-color: #3498db;
        color: white;
        font-weight: bold;
    }
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    blockquote {
        border-left: 4px solid #3498db;
        padding-left: 15px;
        margin-left: 0;
        color: #555;
        font-style: italic;
    }
    a {
        color: #3498db;
        text-decoration: none;
    }
    hr {
        border: none;
        border-top: 2px solid #ecf0f1;
        margin: 30px 0;
    }
    .toc {
        background-color: #ecf0f1;
        padding: 20px;
        border-radius: 5px;
        margin: 20px 0;
    }
</style>
"""

# Create full HTML document
full_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SkillSeeker v2 - Project Documentation</title>
    {css_style}
</head>
<body>
    {html_content}
</body>
</html>
"""

print("Generating PDF...")
try:
    HTML(string=full_html).write_pdf(pdf_file)
    print(f"\n✓ PDF generated successfully!")
    print(f"📄 Location: {pdf_file}")
    print(f"📊 File size: {pdf_file.stat().st_size / 1024:.2f} KB")
except Exception as e:
    print(f"\n✗ Error generating PDF: {e}")
    print("\nTrying alternative method...")
    
    # Fallback: simpler HTML without complex CSS
    simple_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>SkillSeeker v2 Documentation</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            h1 {{ color: #2c3e50; }}
            h2 {{ color: #34495e; }}
            code {{ background-color: #f4f4f4; padding: 2px 5px; }}
            pre {{ background-color: #f8f8f8; padding: 10px; }}
            table {{ border-collapse: collapse; width: 100%; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; }}
            th {{ background-color: #3498db; color: white; }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    HTML(string=simple_html).write_pdf(pdf_file)
    print(f"✓ PDF generated with fallback method!")
    print(f"📄 Location: {pdf_file}")
