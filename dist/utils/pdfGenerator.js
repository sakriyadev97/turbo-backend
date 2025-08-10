"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBulkInvoicePDF = void 0;
const jspdf_1 = __importDefault(require("jspdf"));
const generateBulkInvoicePDF = async (bulkOrder) => {
    try {
        console.log('Starting PDF generation with jsPDF for bulk order:', bulkOrder.orderNumber);
        // Create new PDF document
        const doc = new jspdf_1.default();
        // Set document properties
        doc.setProperties({
            title: `Turbo Order Invoice - ${bulkOrder.orderNumber}`,
            subject: 'Bulk Order Request',
            author: 'Precision Turbo Services',
            creator: 'Turbo Backend System'
        });
        // Set initial position
        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);
        // Helper function to add text with word wrapping
        const addWrappedText = (text, x, y, maxWidth, fontSize = 12) => {
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y);
            return lines.length * fontSize * 0.4; // Return height used
        };
        // Helper function to add a line
        const addLine = (y) => {
            doc.setDrawColor(30, 64, 175); // Blue color
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            return y + 5;
        };
        // Header
        doc.setFillColor(30, 64, 175); // Blue background
        doc.rect(0, 0, pageWidth, 40, 'F');
        // Company logo (using base64 encoded logo)
        try {
            // Read logo file and convert to base64
            const fs = require('fs');
            const path = require('path');
            // When compiled, __dirname points to dist/utils, so we need to go up two levels to reach the backend root
            const logoPath = path.join(__dirname, '../../logo.png');
            const logoBuffer = fs.readFileSync(logoPath);
            const base64Logo = logoBuffer.toString('base64');
            // Add logo using base64 data
            doc.addImage(`data:image/png;base64,${base64Logo}`, 'PNG', 15, 5, 30, 30);
            console.log('Logo added successfully using base64');
        }
        catch (logoError) {
            console.log('Logo loading failed, using fallback:', logoError);
            // Fallback to styled text if logo fails
            doc.setFillColor(255, 255, 255);
            doc.circle(30, 20, 15, 'F');
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(20);
            doc.text('🚗', 25, 25);
        }
        // Company name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Precision Turbo Services', 55, 20);
        // Company subtitle
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Professional Turbo Management Solutions', 55, 30);
        doc.text('Email: turboprecision2@gmail.com', 55, 35);
        // Reset text color and position
        doc.setTextColor(0, 0, 0);
        yPosition = 50;
        // Invoice title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text('INVOICE', pageWidth - margin - 30, yPosition);
        // Invoice details
        yPosition += 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Order #: ${bulkOrder.orderNumber}`, pageWidth - margin - 50, yPosition);
        yPosition += 8;
        doc.text(`Date: ${bulkOrder.orderDate}`, pageWidth - margin - 50, yPosition);
        yPosition += 8;
        doc.text('Status: Pending', pageWidth - margin - 50, yPosition);
        // Reset position for main content
        yPosition = 80;
        // Order summary section
        doc.setFillColor(248, 250, 252); // Light gray background
        doc.rect(margin, yPosition, contentWidth, 40, 'F');
        yPosition += 15;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 65, 81);
        doc.text('Order Summary', margin + 10, yPosition);
        yPosition += 20;
        // Summary grid
        const summaryItems = [
            { label: 'Different Models', value: bulkOrder.items.length.toString() },
            { label: 'Total Quantity', value: bulkOrder.items.reduce((sum, item) => sum + item.quantity, 0).toString() },
            { label: 'Locations', value: new Set(bulkOrder.items.map(item => item.location)).size.toString() }
        ];
        const gridWidth = contentWidth / 3;
        summaryItems.forEach((item, index) => {
            const x = margin + (index * gridWidth) + 5;
            // Value
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 64, 175);
            doc.text(item.value, x + 15, yPosition);
            // Label
            yPosition += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(107, 114, 128);
            doc.text(item.label, x, yPosition);
            yPosition -= 8; // Reset for next column
        });
        yPosition += 30;
        // Items table header
        doc.setFillColor(30, 64, 175);
        doc.rect(margin, yPosition, contentWidth, 15, 'F');
        yPosition += 12;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        const columnWidths = [50, 60, 60, 30];
        const columnPositions = [margin + 5, margin + 55, margin + 115, margin + 175];
        const headers = ['Part Number', 'Model', 'Location', 'Qty'];
        headers.forEach((header, index) => {
            doc.text(header, columnPositions[index], yPosition);
        });
        yPosition += 10;
        // Items table rows
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        bulkOrder.items.forEach((item, index) => {
            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            // Row background (alternating)
            if (index % 2 === 0) {
                doc.setFillColor(249, 250, 251);
                doc.rect(margin, yPosition - 5, contentWidth, 15, 'F');
            }
            // Part Number
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 64, 175);
            doc.text(item.partNumber, columnPositions[0], yPosition);
            // Model
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(item.model, columnPositions[1], yPosition);
            // Location
            doc.text(item.location, columnPositions[2], yPosition);
            // Quantity
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 64, 175);
            doc.text(item.quantity.toString(), columnPositions[3], yPosition);
            yPosition += 15;
        });
        // Footer
        yPosition += 20;
        yPosition = addLine(yPosition);
        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('Precision Turbo Services', margin, yPosition);
        yPosition += 6;
        doc.text('This is an automated order request. Please process the above items.', margin, yPosition);
        yPosition += 6;
        doc.text('For questions, contact: turboprecision2@gmail.com', margin, yPosition);
        yPosition += 6;
        doc.text(`Generated on ${new Date().toLocaleString()}`, margin, yPosition);
        // Convert to buffer
        const pdfBuffer = doc.output('arraybuffer');
        const buffer = Buffer.from(pdfBuffer);
        console.log('PDF generated successfully with jsPDF, buffer size:', buffer.length);
        return buffer;
    }
    catch (error) {
        console.error('Error generating PDF with jsPDF:', error);
        throw new Error(`Failed to generate PDF invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.generateBulkInvoicePDF = generateBulkInvoicePDF;
// Keep the HTML generation function for reference (not used with jsPDF)
const createInvoiceHTML = (bulkOrder) => {
    // This function is kept for reference but not used with jsPDF
    return '';
};
