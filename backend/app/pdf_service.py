from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
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
                header_width = 500
                header_height = 80
                x = (A4[0] - header_width) / 2
                y = A4[1] - 80  
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
            line1 = "Dra. Victoria Potes Eugenes Arana  Fisioterapeuta reg. 60278 U.A.M"
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
        
    
        if is_last_page and 'firma' in self.images_data and self.images_data['firma']:
            try:
                firma_width = 150
                firma_height = 70
                x = 72  
                y = 100   
                canvas.drawImage(self.images_data['firma'], x, y, width=firma_width, height=firma_height)
            except Exception as e:
                print(f"Error drawing signature image: {e}")

class CustomDocTemplate(BaseDocTemplate):
    """Template personalizado para manejar múltiples páginas"""
    
    def __init__(self, filename, images_data, **kwargs):
        BaseDocTemplate.__init__(self, filename, **kwargs)
        self.images_data = images_data
        self.total_pages = 1  
        self.current_page = 0
        self.pages_built = [] 
        
        frame = Frame(
            72, 180,  
            A4[0] - 144, A4[1] - 280,  
            leftPadding=0, bottomPadding=0, rightPadding=0, topPadding=0
        )
        
        template = PageTemplate(id='normal', frames=frame, onPage=self.on_page)
        self.addPageTemplates([template])

    def on_page(self, canvas, doc):
        """Método llamado en cada página"""
        self.current_page += 1
        self.pages_built.append(self.current_page)
        
        if len(self.pages_built) > self.total_pages:
            self.total_pages = len(self.pages_built)
        
        is_last_page = (self.current_page == self.total_pages)
        
        print(f"Drawing page {self.current_page}, total_pages: {self.total_pages}, is_last_page: {is_last_page}")
        
        numbered_canvas = NumberedCanvas(canvas, doc, self.images_data)
        numbered_canvas.draw_page_elements(is_last_page)
        
        canvas.setFont('Helvetica', 9)
        canvas.drawRightString(A4[0] - 72, 15, f"Página {self.current_page} de {self.total_pages}")

    def build(self, flowables, **kwargs):
        """Override build method simplificado"""
        self.current_page = 0
        self.pages_built = []
        
        BaseDocTemplate.build(self, flowables, **kwargs)
        
        actual_total = len(self.pages_built)
        
        if actual_total != self.total_pages:
            print(f"Rebuilding PDF with correct page count: {actual_total}")
            self.total_pages = actual_total
            self.current_page = 0
            self.pages_built = []
            
            BaseDocTemplate.build(self, flowables, **kwargs)

class PDFService:
    @staticmethod
    def load_pdf_images() -> Dict[str, str]:
        """Cargar imágenes desde el directorio assets del backend"""
        images_data = {}
        
        current_dir = Path(__file__).parent
        images_dir = current_dir / "assets" / "images" / "pdf"
        
        print(f"Looking for images in: {images_dir}")
        
        images_dir.mkdir(parents=True, exist_ok=True)
        
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
        
        # load images from the backend
        images_data = PDFService.load_pdf_images()
        
        doc = CustomDocTemplate(buffer, images_data, pagesize=A4)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.darkblue
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=6
        )
        
        story = []
        
        # Títle
        title = Paragraph("HISTORIA CLÍNICA", title_style)
        story.append(title)
        story.append(Spacer(1, 20))
        
        # Patient information
        patient_title = Paragraph("", subtitle_style)
        story.append(patient_title)
        
        patient_data = [
            ['Nombre:', f"{user.name} {user.last_name}"],
            ['Identificación:', user.identification],
            ['Género:', 'Masculino' if user.gender == 'M' else 'Femenino' if user.gender == 'F' else 'Otro']
        ]
        
        patient_table = Table(patient_data, colWidths=[2*inch, 4*inch])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(patient_table)
        story.append(Spacer(1, 20))
        
        
        if hasattr(user, 'medical_record') and user.medical_record:
            medical_record = user.medical_record
            
            medical_title = Paragraph(" ", subtitle_style)
            story.append(medical_title)
            
            medical_data = [
                ['Fecha:', medical_record.date.strftime('%d/%m/%Y') if hasattr(medical_record, 'date') and medical_record.date else 'No especificada'],
                ['Edad del paciente:', str(medical_record.user_age) if hasattr(medical_record, 'user_age') and medical_record.user_age else 'No especificada'],
                ['Diagnóstico:', medical_record.diagnosis if hasattr(medical_record, 'diagnosis') and medical_record.diagnosis else 'No especificado'],
                ['Motivo de consulta:', medical_record.consultation_reason if hasattr(medical_record, 'consultation_reason') and medical_record.consultation_reason else 'No especificado'],
                ['Número de sesiones:', str(medical_record.sessions) if hasattr(medical_record, 'sessions') and medical_record.sessions else 'No especificado']
            ]
            
            medical_table = Table(medical_data, colWidths=[2*inch, 4*inch])
            medical_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(medical_table)
            story.append(Spacer(1, 20))
            
            if hasattr(medical_record, 'evolutions') and medical_record.evolutions:
                evolutions_title = Paragraph("EVOLUCIONES", subtitle_style)
                story.append(evolutions_title)
                
                for i, evolution in enumerate(medical_record.evolutions, 1):
                    evolution_date = evolution.date.strftime('%d/%m/%Y') if hasattr(evolution, 'date') and evolution.date else 'Fecha no especificada'
                    evolution_observations = evolution.observations if hasattr(evolution, 'observations') and evolution.observations else 'Sin observaciones'
                    evolution_text = f"<b>Evolución {i} - {evolution_date}:</b><br/>{evolution_observations}"
                    evolution_para = Paragraph(evolution_text, normal_style)
                    story.append(evolution_para)
                    story.append(Spacer(1, 10))
        else:
            no_medical_text = Paragraph("No hay historia clínica registrada para este paciente.", normal_style)
            story.append(no_medical_text)
                
        
        doc.build(story)
        
        buffer.seek(0)
        return buffer
    
    @staticmethod
    def generate_final_report(user: models.User) -> BytesIO:
        """Genera un informe final PDF para un usuario específico"""
        buffer = BytesIO()
        
        # Cargar imágenes del backend
        images_data = PDFService.load_pdf_images()
        
        # Crear documento con template personalizado
        doc = CustomDocTemplate(buffer, images_data, pagesize=A4)
        
        # Estilos (iguales que generate_user_report)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.darkblue
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=6
        )
        
        # Contenido del PDF
        story = []
        
        # TÍTULO PRINCIPAL - INFORME FINAL
        title = Paragraph("INFORME FINAL", title_style)
        story.append(title)
        story.append(Spacer(1, 20))
        
        # Información del informe final
        if hasattr(user, 'medical_record') and user.medical_record:
            medical_record = user.medical_record
            
            # Tabla de información del informe final
            report_data = [
                ['Fecha:', medical_record.date.strftime('%d/%m/%Y') if hasattr(medical_record, 'date') and medical_record.date else 'No especificada'],
                ['Nombre:', f"{user.name} {user.last_name}"],
                ['Cc:', user.identification],
                ['Edad:', str(medical_record.user_age) if hasattr(medical_record, 'user_age') and medical_record.user_age else 'No especificada'],
                ['Diagnóstico:', medical_record.diagnosis if hasattr(medical_record, 'diagnosis') and medical_record.diagnosis else 'No especificado'],
                ['Sesiones:', str(medical_record.sessions) if hasattr(medical_record, 'sessions') and medical_record.sessions else 'No especificado']
            ]
            
            report_table = Table(report_data, colWidths=[2*inch, 4*inch])
            report_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(report_table)
            story.append(Spacer(1, 20))
            
            # Campo REPORT (contenido del informe final)
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
        
        # Construir PDF
        doc.build(story)
        
        buffer.seek(0)
        return buffer