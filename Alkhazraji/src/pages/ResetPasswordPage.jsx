import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const navigate = useNavigate();

    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'var(--bg-main, #0a0a0a)',
        direction: 'rtl',
    };

    const cardStyle = {
        width: '100%',
        maxWidth: '460px',
        padding: '40px',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    };

    const titleStyle = {
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '1.8rem',
        color: '#ff6b6b',
        fontFamily: 'var(--font-main, Cairo, sans-serif)',
        fontWeight: '700',
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <AlertCircle size={48} color="#ff6b6b" />
                </div>
                <h2 style={titleStyle}>غير مدعوم</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-dim, #888)', marginBottom: '30px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    هذه الميزة غير متاحة في النسخة الحالية.
                </p>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ width: '100%' }}>
                    العودة إلى الصفحة الرئيسية
                </button>
            </div>
        </div>
    );
}
