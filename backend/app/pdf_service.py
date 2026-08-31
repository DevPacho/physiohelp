from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
from reportlab.platypus.frames import Frame
from io import BytesIO
from datetime import datetime
from typing import Optional, Dict
import os
from pathlib import Path
import base64
import requests

from . import models




class NumberedCanvas:
    """Canvas personalizado para agregar header, footer, fondo y firma"""
    
    def __init__(self, canvas, doc, images_data):
        self.canvas = canvas
        self.doc = doc
        self.images_data = images_data

    def draw_page_elements(self, is_last_page=False):
        """Dibuja los elementos de cada página"""
        canvas = self.canvas    
        
        # background image
        if 'fondo' in self.images_data and self.images_data['fondo']:
            try:
                canvas.saveState()
                canvas.setFillAlpha(0.7)  
                img_width = 400
                img_height = 300
                x = (A4[0] - img_width) / 2
                y = (A4[1] - img_height) / 2
                canvas.drawImage(self.images_data['fondo'], x, y, width=img_width, height=img_height, mask='auto')
                canvas.restoreState()
            except Exception as e:
                print(f"Error drawing background image: {e}")
        
        # Header
        if 'header' in self.images_data and self.images_data['header']:
            try:
                header_width = 310
                header_height = 80
                x = (A4[0] - header_width) / 2
                y = A4[1] - 90  
                canvas.drawImage(self.images_data['header'], x, y, width=header_width, height=header_height)
            except Exception as e:
                print(f"Error drawing header image: {e}")
        
        try:
            # Footer
            canvas.saveState()
            canvas.setFillAlpha(0.7)  
            
            canvas.setFont('Helvetica', 9)
            canvas.setFillColor(colors.black)
            
            page_width = A4[0]
            
            # First line
            line1 = "Dra. Victoria Eugenia Potes Arana  Fisioterapeuta reg. 60278 U.A.M"
            line1_width = canvas.stringWidth(line1, 'Helvetica', 9)
            x1 = (page_width - line1_width) / 2
            y1 = 80  # Position Y for the first line
            canvas.drawString(x1, y1, line1)

            # Second line
            line2 = "Calle 10 #14a-317 La primavera Rozo"
            line2_width = canvas.stringWidth(line2, 'Helvetica', 9)
            x2 = (page_width - line2_width) / 2
            y2 = 65  # 15 points below the first line
            canvas.drawString(x2, y2, line2)

            # Third line
            line3 = "Celular 3104387862"
            line3_width = canvas.stringWidth(line3, 'Helvetica', 9)
            x3 = (page_width - line3_width) / 2
            y3 = 50  # 15 points below the second line
            canvas.drawString(x3, y3, line3)

            # Restore canvas state
            canvas.restoreState()
            
        except Exception as e:
            print(f"Error drawing footer text: {e}")       
        


class CustomDocTemplate(BaseDocTemplate):
    """Template personalizado para manejar múltiples páginas"""
    
    def __init__(self, filename, images_data, **kwargs):
        BaseDocTemplate.__init__(self, filename, **kwargs)
        self.images_data = images_data
        
        frame = Frame(
            72, 100,  
            A4[0] - 144, A4[1] - 200,  
            leftPadding=0, bottomPadding=0, rightPadding=0, topPadding=0
        )
        
        template = PageTemplate(id='normal', frames=frame, onPage=self.on_page, onPageEnd=self.on_page_end)
        self.addPageTemplates([template])
        
    def on_page(self, canvas, doc):
        """Método llamado en cada página para dibujar elementos de fondo/cabecera"""
        numbered_canvas = NumberedCanvas(canvas, doc, self.images_data)
        numbered_canvas.draw_page_elements()

    def on_page_end(self, canvas, doc):
        """Método llamado al final de cada página para numeración"""
        page_num = canvas.getPageNumber()
        canvas.setFont('Helvetica', 9)
        canvas.drawRightString(A4[0] - 72, 15, f"Página {page_num}")

    # Eliminamos el complejo manejo de 'is_last_page' que no era fiable
    # El método build por defecto y el onPageEnd son suficientes ahora.
    
class PDFService:
    @staticmethod
    def load_pdf_images() -> Dict[str, str]:
        """Cargar imágenes desde el directorio assets del backend"""
        images_data = {}
        
        # Para que el script se pueda ejecutar, simulamos la ruta y la creación de un archivo de firma.
        current_dir = Path(__file__).parent
        images_dir = current_dir / "assets" / "images" / "pdf"
        
        print(f"Looking for images in: {images_dir}")
        
        images_dir.mkdir(parents=True, exist_ok=True)
        
        # Crear una imagen de firma falsa si no existe
        firma_path = images_dir / "firma.png"
        if not firma_path.exists():
            try:
                # Usar Pillow para crear una imagen simple
                from PIL import Image as PILImage, ImageDraw, ImageFont
                img = PILImage.new('RGB', (300, 140), color = 'white')
                draw = ImageDraw.Draw(img)
                try:
                    # Intenta cargar una fuente, si no, usa la por defecto
                    font = ImageFont.truetype("arial.ttf", 40)
                except IOError:
                    font = ImageFont.load_default()
                draw.text((10,10), "Firma Digital", fill='black', font=font)
                draw.line((10, 80, 290, 80), fill='black', width=3)
                img.save(firma_path)
                print(f"Created dummy signature at {firma_path}")
            except ImportError:
                print("Pillow no está instalado. No se pudo crear la imagen de firma de prueba.")
            except Exception as e:
                print(f"Error creating dummy signature: {e}")


        image_files = {
            'header': 'header.png',
            'footer': 'footer.png', 
            'firma': 'firma.png',
            'fondo': 'fondo.png'
        }
        
        for key, filename in image_files.items():
            image_path = images_dir / filename
            if image_path.exists():
                images_data[key] = str(image_path)
                print(f"Found image: {key} at {image_path}")
            else:
                print(f"Warning: Image not found: {image_path}")
                images_data[key] = None
                
        return images_data

    @staticmethod
    def generate_user_report(user: models.User) -> BytesIO:
        """Genera una historia clinica PDF para un usuario específico"""
        buffer = BytesIO()
        
        images_data = PDFService.load_pdf_images()
        
        doc = CustomDocTemplate(buffer, images_data, pagesize=A4)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle', parent=styles['Heading1'], fontSize=18, spaceAfter=15, alignment=TA_CENTER, textColor=colors.black
        )
        subtitle_style = ParagraphStyle(
            'CustomSubtitle', parent=styles['Heading2'], fontSize=14, spaceAfter=12, textColor=colors.black
        )
        normal_style = ParagraphStyle(
            'CustomNormal', parent=styles['Normal'], fontSize=12, spaceAfter=6, alignment=TA_JUSTIFY
        )
        bold_style = ParagraphStyle(
            'CustomBold', parent=normal_style, fontName='Helvetica-Bold'
        )
        
        story = []
        
        title = Paragraph("HISTORIA CLÍNICA", title_style)
        story.append(Spacer(1, 40))
        story.append(title)
        
        patient_data = [
            [Paragraph('<b>NOMBRE:</b>', normal_style), Paragraph(f"{user.name} {user.last_name}", normal_style)],
            [Paragraph('<b>CC:</b>', normal_style), Paragraph(user.identification, normal_style)],
            [Paragraph('<b>GÉNERO:</b>', normal_style), Paragraph('Masculino' if user.gender == 'M' else 'Femenino' if user.gender == 'F' else 'Otro', normal_style)]
        ]
        patient_table = Table(patient_data, colWidths=[2*inch, 4*inch])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.Color(0.95, 0.95, 0.95)),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(patient_table)
        
        
        if hasattr(user, 'medical_record') and user.medical_record:
            medical_record = user.medical_record
            
            medical_items = [
                ('<b>FECHA</b>:', medical_record.date.strftime('%d/%m/%Y') if hasattr(medical_record, 'date') and medical_record.date else 'No especificada'),
                ('<b>EDAD</b>:', f"{medical_record.user_age} {'año' if medical_record.user_age == 1 else 'años'}" if hasattr(medical_record, 'user_age') and medical_record.user_age is not None else 'No especificada'),
                ('<b>DIAGNÓSTICO:</b>', medical_record.diagnosis if hasattr(medical_record, 'diagnosis') and medical_record.diagnosis else 'No especificado'),
                ('<b>MOTIVO DE CONSULTA</b>:', medical_record.consultation_reason if hasattr(medical_record, 'consultation_reason') and medical_record.consultation_reason else 'No especificado'),
                ('<b>SESIONES</b>:', str(medical_record.sessions) if hasattr(medical_record, 'sessions') and medical_record.sessions else 'No especificado')
            ]
            
            for i, (label, content) in enumerate(medical_items):
                row_data = [[Paragraph(label, bold_style), Paragraph(content, normal_style)]]
                row_table = Table(row_data, colWidths=[2*inch, 4*inch])
                
                style = TableStyle([
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ('BACKGROUND', (0, 0), (0, 0), colors.Color(0.95, 0.95, 0.95)),
                ])
                
                if i > 0:
                    style.add('LINEABOVE', (0, 0), (-1, 0), 1, colors.transparent)

                row_table.setStyle(style)
                story.append(row_table)

            story.append(Spacer(1, 20))
            
            if hasattr(medical_record, 'evolutions') and medical_record.evolutions:
                evolutions_title = Paragraph("EVOLUCIONES", subtitle_style)
                story.append(evolutions_title)

                signature_image = None
                if 'firma' in images_data and images_data['firma']:
                    try:
                        signature_image = Image(images_data['firma'], width=1.5*inch, height=0.7*inch)
                        signature_image.hAlign = 'LEFT'
                    except Exception as e:
                        print(f"Error al crear el objeto de imagen para la firma: {e}")

                for i, evolution in enumerate(medical_record.evolutions, 1):
                    evolution_text = f"<b>{evolution.date.strftime('%d/%m/%Y')}:</b><br/>{evolution.observations}"
                    evolution_para = Paragraph(evolution_text, normal_style)

                    evolution_block = [evolution_para]
                    
                    if signature_image:
                        evolution_block.append(Spacer(1, 6))  
                        evolution_block.append(signature_image)
                    
                    story.append(KeepTogether(evolution_block))
                    
                    story.append(Spacer(1, 18))
        else:
            story.append(Paragraph("No hay historia clínica registrada para este paciente.", normal_style))
        
        story.append(PageBreak())

        story.append(Spacer(1, 40))
        
        signature_title = Paragraph("REGISTRO DIARIO DEL PACIENTE", title_style)
        story.append(signature_title)
        story.append(Spacer(1, 30))

        paciente_data = [[Paragraph('<b>PACIENTE</b>', bold_style), Paragraph(f"<b>{user.name} {user.last_name} CC: {user.identification}</b>", normal_style)]]
        paciente_table = Table(paciente_data, colWidths=[1.5*inch, 4.5*inch])
        paciente_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0,0), (-1,-1), 10), ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('BACKGROUND', (0, 0), (0, 0), colors.Color(0.95, 0.95, 0.95)),
            ('LINEBELOW', (0, -1), (-1, -1), 1, colors.transparent),
        ]))
        story.append(paciente_table)

        diag_content = (medical_record.diagnosis if hasattr(user, 'medical_record') and user.medical_record and user.medical_record.diagnosis else 'No especificado')
        diagnostico_data = [[Paragraph('<b>DIAGNÓSTICO</b>', bold_style), Paragraph(f"<b>{diag_content}</b>", normal_style)]]
        diagnostico_table = Table(diagnostico_data, colWidths=[1.5*inch, 4.5*inch])
        diagnostico_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0,0), (-1,-1), 10), ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('BACKGROUND', (0, 0), (0, 0), colors.Color(0.95, 0.95, 0.95)),
            ('LINEABOVE', (0, 0), (-1, 0), 1, colors.transparent),
            ('LINEBELOW', (0, -1), (-1, -1), 1, colors.transparent),
        ]))
        story.append(diagnostico_table)

        signature_list_data = [[Paragraph('<b>FECHA</b>', bold_style), Paragraph('<b>FIRMA</b>', bold_style)]]
        if hasattr(user, 'medical_record') and user.medical_record and hasattr(user.medical_record, 'evolutions') and user.medical_record.evolutions:
            for evolution in user.medical_record.evolutions:
                signature_list_data.append([Paragraph(evolution.date.strftime('%d/%m/%Y'), normal_style), ''])
        else:
            signature_list_data.append([Paragraph('No hay evoluciones registradas', normal_style), ''])
        
        signature_table = Table(signature_list_data, colWidths=[1.5*inch, 4.5*inch])
        signature_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 10), ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 20),
            ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.95, 0.95, 0.95)),
            ('LINEABOVE', (0, 0), (-1, 0), 1, colors.transparent),
        ]))
        story.append(signature_table)

        if 'firma' in images_data and images_data['firma']:
            try:
                story.append(Spacer(1, 24))  
                firma_img = Image(images_data['firma'], width=150, height=70)
                firma_img.hAlign = 'LEFT' 
                story.append(firma_img)
            except Exception as e:
                print(f"Error al añadir la imagen de la firma al story: {e}")
        
        doc.build(story)
        
        buffer.seek(0)
        return buffer
    

    @staticmethod
    def generate_final_report(user: models.User) -> BytesIO:
        """Genera un informe final PDF para un usuario específico"""
        buffer = BytesIO()
        
        images_data = PDFService.load_pdf_images()
        
        doc = CustomDocTemplate(buffer, images_data, pagesize=A4)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle', parent=styles['Heading1'], fontSize=18, spaceAfter=30, alignment=TA_CENTER, textColor=colors.black
        )
        subtitle_style = ParagraphStyle(
            'CustomSubtitle', parent=styles['Heading2'], fontSize=14, spaceAfter=12, textColor=colors.black
        )
        normal_style = ParagraphStyle(
            'CustomNormal', parent=styles['Normal'], fontSize=12, spaceAfter=6, alignment=TA_JUSTIFY
        )
        
        story = []
        story.append(Spacer(1, 25))
        
        title = Paragraph("INFORME FINAL", title_style)
        story.append(title)
        story.append(Spacer(1, 5))
        
        if hasattr(user, 'medical_record') and user.medical_record:
            medical_record = user.medical_record
            
            report_data = [
                [Paragraph('<b>FECHA:</b>'), medical_record.date.strftime('%d/%m/%Y') if hasattr(medical_record, 'date') and medical_record.date else 'No especificada'],
                [Paragraph('<b>NOMBRE:</b>'), f"{user.name} {user.last_name}"],
                [Paragraph('<b>CC:</b>'), user.identification],
                [Paragraph('<b>EDAD:</b>'), f"{medical_record.user_age} {'año' if medical_record.user_age == 1 else 'años'}" if hasattr(medical_record, 'user_age') and medical_record.user_age is not None else 'No especificada'],
                [Paragraph('<b>DIAGNÓSTICO:</b>'), Paragraph(medical_record.diagnosis if hasattr(medical_record, 'diagnosis') and medical_record.diagnosis else 'No especificado', normal_style)],
                [Paragraph('<b>SESIONES:</b>'), str(medical_record.sessions) if hasattr(medical_record, 'sessions') and medical_record.sessions else 'No especificado']
            ]
            
            report_table = Table(report_data, colWidths=[2*inch, 4*inch])
            report_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.Color(0.95, 0.95, 0.95)),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(report_table)
            story.append(Spacer(1, 20))
            
            if hasattr(medical_record, 'report') and medical_record.report:
                report_title = Paragraph("INFORME:", subtitle_style)
                story.append(report_title)
                report_content = Paragraph(medical_record.report, normal_style)
                story.append(report_content)
            else:
                no_report_text = Paragraph("No hay informe registrado para este paciente.", normal_style)
                story.append(no_report_text)
        else:
            no_medical_text = Paragraph("No hay información médica registrada para este paciente.", normal_style)
            story.append(no_medical_text)

        if 'firma' in images_data and images_data['firma']:
                try:
                    story.append(Spacer(1, 15)) 
                    firma_img = Image(images_data['firma'], width=150, height=70)
                    firma_img.hAlign = 'LEFT'
                    story.append(firma_img)
                except Exception as e:
                    print(f"Error al añadir la imagen de la firma al story: {e}")    

        doc.build(story)
        
        buffer.seek(0)
        return buffer

