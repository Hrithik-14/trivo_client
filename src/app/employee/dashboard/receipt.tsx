import React, { useState } from 'react';
import { X, Download, FileText, User, MapPin, Phone, Mail } from 'lucide-react';

interface PayslipData {
  _id: string;
  employeeCode: string;
  employeeName: string;
  email: string;
  phoneNumber: string;
  designation: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  basicSalary: number;
  allowance: number;
  bonus?: number;
  incentive?: number;
  tax?: number;
  salaryDate: string;
  profileImage?: string;
}

interface PayslipReceiptModalProps {
  payslip: PayslipData;
  onClose: () => void;
}

const PayslipReceiptModal: React.FC<PayslipReceiptModalProps> = ({ payslip, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateTotals = () => {
    const totalEarnings = payslip.basicSalary + payslip.allowance + (payslip.bonus || 0) + (payslip.incentive || 0);
    const totalDeductions = payslip.tax || 0;
    const netSalary = totalEarnings - totalDeductions;
    
    return { totalEarnings, totalDeductions, netSalary };
  };

  const { totalEarnings, totalDeductions, netSalary } = calculateTotals();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  const generateInvoiceNumber = () => {
    return `PAY${payslip.employeeCode}${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked');
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payslip - ${payslip.employeeName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.4; 
              color: #333;
              background: white;
            }
            .receipt-container { 
              max-width: 800px; 
              margin: 20px auto; 
              background: white; 
              border: 1px solid #ddd;
              border-radius: 8px;
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              padding: 25px; 
              text-align: center;
            }
            .company-name { 
              font-size: 32px; 
              font-weight: bold; 
              letter-spacing: 3px; 
              margin-bottom: 5px;
            }
            .company-details { 
              font-size: 12px; 
              opacity: 0.9; 
            }
            .content { padding: 30px; }
            .invoice-details { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 30px;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 20px;
            }
            .employee-info { flex: 1; }
            .pay-info { text-align: right; }
            .info-label { 
              font-weight: bold; 
              color: #555; 
              font-size: 12px; 
              margin-bottom: 5px;
            }
            .info-value { 
              font-size: 14px; 
              margin-bottom: 12px;
            }
            .salary-section { margin: 25px 0; }
            .section-title { 
              font-size: 16px; 
              font-weight: bold; 
              color: #333; 
              margin-bottom: 15px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .salary-item { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px 0; 
              border-bottom: 1px solid #f5f5f5;
            }
            .salary-item:last-child { border-bottom: none; }
            .earnings { color: #16a085; }
            .deductions { color: #e74c3c; }
            .total-section { 
              background: #f8f9fa; 
              padding: 20px; 
              margin: 20px -30px -30px -30px;
              border-top: 2px solid #dee2e6;
            }
            .grand-total { 
              display: flex; 
              justify-content: space-between; 
              font-size: 18px; 
              font-weight: bold; 
              color: #2c3e50;
            }
            .amount-note { 
              font-size: 12px; 
              color: #666; 
              margin-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .receipt-container { 
                box-shadow: none; 
                border: none; 
                margin: 0;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="company-name">TRIVO</div>
              <div class="company-details">
                Business Street, Kinfra, 600<br>
                +91 9533434334 | company@trivo.com
              </div>
            </div>
            
            <div class="content">
              <div class="invoice-details">
                <div class="employee-info">
                  <div class="info-label">EMPLOYEE DETAILS</div>
                  <div class="info-value"><strong>${payslip.employeeName}</strong></div>
                  <div class="info-value">${payslip.designation}</div>
                  <div class="info-value">${payslip.email}</div>
                  <div class="info-value">${payslip.phoneNumber}</div>
                  <div class="info-value">${payslip.street}, ${payslip.city}</div>
                  <div class="info-value">${payslip.state} - ${payslip.pincode}</div>
                </div>
                <div class="pay-info">
                  <div class="info-label">PAYSLIP NO.</div>
                  <div class="info-value">${generateInvoiceNumber()}</div>
                  <div class="info-label">PAY DATE</div>
                  <div class="info-value">${formatDate(payslip.salaryDate)}</div>
                  <div class="info-label">EMPLOYEE ID</div>
                  <div class="info-value">${payslip.employeeCode}</div>
                </div>
              </div>

              <div class="salary-section">
                <div class="section-title earnings">EARNINGS</div>
                <div class="salary-item">
                  <span>Basic Salary</span>
                  <span>₹${payslip.basicSalary.toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>Allowance</span>
                  <span>₹${payslip.allowance.toLocaleString()}</span>
                </div>
                ${payslip.bonus && payslip.bonus > 0 ? `
                  <div class="salary-item">
                    <span>Bonus</span>
                    <span>₹${payslip.bonus.toLocaleString()}</span>
                  </div>
                ` : ''}
                ${payslip.incentive && payslip.incentive > 0 ? `
                  <div class="salary-item">
                    <span>Incentive</span>
                    <span>₹${payslip.incentive.toLocaleString()}</span>
                  </div>
                ` : ''}
              </div>

              ${totalDeductions > 0 ? `
                <div class="salary-section">
                  <div class="section-title deductions">DEDUCTIONS</div>
                  <div class="salary-item">
                    <span>Tax (10%)</span>
                    <span>₹${(payslip.tax || 0).toLocaleString()}</span>
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="total-section">
              <div class="grand-total">
                <span>Net Salary</span>
                <span>₹${netSalary.toLocaleString()}</span>
              </div>
              <div class="amount-note">
                Amount to be credited to your account
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header with Download Button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={20} />
            Payslip Receipt
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Download size={16} />
              {isGenerating ? 'Generating...' : 'Download'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="max-w-3xl mx-auto bg-white">
            
            {/* Company Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 text-center">
              <h1 className="text-4xl font-bold tracking-widest mb-2">TRIVO</h1>
              <p className="text-sm opacity-90">
                Business Street, Kinfra, 600<br/>
                +91 9533434334 | company@trivo.com
              </p>
            </div>

            <div className="p-8">
              {/* Invoice Details */}
              <div className="flex justify-between mb-8 pb-6 border-b-2 border-gray-100">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-600 mb-4">EMPLOYEE DETAILS</h3>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{payslip.employeeName}</p>
                    <p className="text-gray-700">{payslip.designation}</p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail size={14} />
                      {payslip.email}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Phone size={14} />
                      {payslip.phoneNumber}
                    </p>
                    <p className="text-gray-600 flex items-start gap-2">
                      <MapPin size={14} className="mt-0.5" />
                      <span>{payslip.street}, {payslip.city}<br/>{payslip.state} - {payslip.pincode}</span>
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <h3 className="text-sm font-bold text-gray-600 mb-4">PAYSLIP INFO</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Payslip No.</p>
                      <p className="font-semibold">{generateInvoiceNumber()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pay Date</p>
                      <p className="font-semibold">{formatDate(payslip.salaryDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Employee ID</p>
                      <p className="font-semibold">{payslip.employeeCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-green-600 mb-4 border-b border-green-200 pb-2">
                  EARNINGS
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span>Basic Salary</span>
                    <span className="font-semibold">₹{payslip.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span>Allowance</span>
                    <span className="font-semibold">₹{payslip.allowance.toLocaleString()}</span>
                  </div>
                  {payslip.bonus && payslip.bonus > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span>Bonus</span>
                      <span className="font-semibold">₹{payslip.bonus.toLocaleString()}</span>
                    </div>
                  )}
                  {payslip.incentive && payslip.incentive > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span>Incentive</span>
                      <span className="font-semibold">₹{payslip.incentive.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deductions Section */}
              {totalDeductions > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-red-600 mb-4 border-b border-red-200 pb-2">
                    DEDUCTIONS
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span>Tax (10%)</span>
                      <span className="font-semibold">₹{(payslip.tax || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Section */}
              <div className="bg-gray-50 p-6 rounded-lg border-t-4 border-indigo-600">
                <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                  <span>Net Salary</span>
                  <span>₹{netSalary.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Amount to be credited to your account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const PayslipDemo = () => {
  const [showModal, setShowModal] = useState(false);

  const samplePayslip: PayslipData = {
    _id: '1',
    employeeCode: 'EMP001',
    employeeName: 'John Doe',
    email: 'john.doe@trivo.com',
    phoneNumber: '+91 9876543210',
    designation: 'Software Engineer',
    street: '123 Tech Street',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    basicSalary: 40500,
    allowance: 1500,
    bonus: 2000,
    incentive: 1000,
    tax: 4500,
    salaryDate: '2025-01',
    profileImage: ''
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <FileText size={20} />
          View Payslip Receipt
        </button>
      </div>

      {showModal && (
        <PayslipReceiptModal
          payslip={samplePayslip}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default PayslipDemo;