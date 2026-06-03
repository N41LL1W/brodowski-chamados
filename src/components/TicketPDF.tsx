import {
    Document, Page, Text, View, StyleSheet
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page:        { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a', backgroundColor: '#ffffff' },

    header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2 solid #111', paddingBottom: 14, marginBottom: 18 },
    headerLeft:  { flex: 1 },
    systemName:  { fontSize: 20, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },
    systemSub:   { fontSize: 8, color: '#666', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
    emitido:     { fontSize: 8, color: '#999', marginTop: 5 },

    protocolBox: { backgroundColor: '#111', padding: '8 14', borderRadius: 4, alignItems: 'flex-end' },
    protocolLabel:{ fontSize: 7, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
    protocolNum: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#fff', marginTop: 3 },

    statusBadge: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-end' },
    statusText:  { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },

    sectionTitle: { fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, color: '#2563eb', marginBottom: 8, marginTop: 18, fontFamily: 'Helvetica-Bold' },
    divider:      { borderBottom: '0.5 solid #e5e7eb', marginBottom: 10 },

    infoGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    infoItem:    { width: '47%', marginBottom: 8 },
    infoLabel:   { fontSize: 7, color: '#888', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 3 },
    infoValue:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111' },
    infoValueNormal: { fontSize: 10, color: '#333' },

    descBox:     { backgroundColor: '#f9fafb', padding: '10 12', borderRadius: 4, borderLeft: '3 solid #2563eb', marginBottom: 10 },
    subjectText: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 6 },
    descText:    { fontSize: 10, color: '#475569', lineHeight: 1.6, fontStyle: 'italic' },

    timelineItem:   { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
    timelineDot:    { width: 7, height: 7, borderRadius: 3.5, marginTop: 2, flexShrink: 0 },
    timelineContent:{ flex: 1 },
    timelineTitle:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111' },
    timelineSub:    { fontSize: 8, color: '#666', marginTop: 2 },
    timelineTime:   { fontSize: 7, color: '#999', marginTop: 2 },

    commentBox:      { backgroundColor: '#f9fafb', padding: '7 10', borderRadius: 4, marginBottom: 5, borderLeft: '2 solid #e5e7eb' },
    commentInterno:  { backgroundColor: '#fffbeb', borderLeft: '2 solid #f59e0b' },
    commentAuthor:   { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#555', marginBottom: 3 },
    commentText:     { fontSize: 9, color: '#333', lineHeight: 1.5 },

    visitBox:    { backgroundColor: '#eff6ff', padding: '10 12', borderRadius: 4, borderLeft: '3 solid #3b82f6', marginBottom: 10 },
    visitLabel:  { fontSize: 7, color: '#3b82f6', textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
    visitDate:   { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1e40af' },
    visitNote:   { fontSize: 9, color: '#3b82f6', marginTop: 4 },

    signatureBox:   { flexDirection: 'row', gap: 24, marginTop: 20 },
    signature:      { flex: 1, borderTop: '0.5 solid #111', paddingTop: 8 },
    signatureLabel: { fontSize: 7, color: '#888', textAlign: 'center' },
    signatureName:  { fontSize: 9, color: '#333', textAlign: 'center', marginTop: 3 },

    footer:      { position: 'absolute', bottom: 24, left: 40, right: 40, borderTop: '0.5 solid #e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
    footerText:  { fontSize: 7, color: '#aaa' },
});

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    ABERTO:       { bg: '#fef3c7', text: '#92400e' },
    OPEN:         { bg: '#fef3c7', text: '#92400e' },
    EM_ANDAMENTO: { bg: '#dbeafe', text: '#1e40af' },
    IN_PROGRESS:  { bg: '#dbeafe', text: '#1e40af' },
    EM_PAUSA:     { bg: '#ede9fe', text: '#5b21b6' },
    CONCLUIDO:    { bg: '#d1fae5', text: '#065f46' },
    CONCLUDED:    { bg: '#d1fae5', text: '#065f46' },
};

const PRIORITY_COLORS: Record<string, string> = {
    URGENTE: '#ef4444', ALTA: '#f59e0b', NORMAL: '#3b82f6', BAIXA: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
    ABERTO: 'Aberto', OPEN: 'Aberto',
    EM_ANDAMENTO: 'Em Andamento', IN_PROGRESS: 'Em Andamento',
    EM_PAUSA: 'Pausado',
    CONCLUIDO: 'Concluído', CONCLUDED: 'Concluído',
};

function fmt(d: any) {
    if (!d) return '—';
    return new Date(d).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function fmtDate(d: any) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('pt-BR');
}

// Garante que o valor é string legível, não um ID técnico
function safe(value: any): string {
    if (!value) return '—';
    if (typeof value === 'string') {
        // Se parece um CUID (começa com c e tem 25+ chars sem espaço), retorna —
        if (/^c[a-z0-9]{20,}$/.test(value)) return '—';
        return value;
    }
    return String(value);
}

export const TicketPDF = ({ ticket, systemName, cityName }: {
    ticket: any;
    systemName?: string;
    cityName?: string;
}) => {
    const sysName  = systemName || 'Central de Chamados';
    const sysCity  = cityName   || '';
    const subTitle = sysCity
        ? `Chamados Técnicos — ${sysCity}`
        : 'Sistema de Chamados Técnicos';

    const statusStyle = STATUS_COLORS[ticket.status] || { bg: '#f3f4f6', text: '#374151' };
    const isConcluido = ['CONCLUIDO', 'CONCLUDED'].includes(ticket.status);

    const requesterName = safe(ticket.requester?.name);
    const categoryName  = safe(ticket.category?.name);
    const departName    = safe(ticket.department?.name);
    const assignedName  = safe(ticket.assignedTo?.name) !== '—'
        ? ticket.assignedTo?.name
        : 'Não atribuído';

    const comentariosPublicos = ticket.comments?.filter((c: any) =>
        !c.content.startsWith('[VISITA]') &&
        !c.content.includes('[INTERNO]') &&
        c.content !== 'Foto anexada ao chamado.' &&
        c.content !== 'Foto anexada na abertura do chamado.'
    ) || [];

    const notasInternas = ticket.comments?.filter((c: any) =>
        c.content.includes('[INTERNO]') && !c.content.startsWith('[VISITA]')
    ) || [];

    const fotosAnexadas = ticket.comments?.filter((c: any) => c.proofImage) || [];
    const visitasLog    = ticket.comments?.filter((c: any) => c.content.startsWith('[VISITA]')) || [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* CABEÇALHO */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.systemName}>{sysName}</Text>
                        <Text style={styles.systemSub}>{subTitle}</Text>
                        <Text style={styles.emitido}>Emitido em: {fmt(new Date())}</Text>
                    </View>
                    <View style={styles.protocolBox}>
                        <Text style={styles.protocolLabel}>Protocolo</Text>
                        <Text style={styles.protocolNum}>{ticket.protocol}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                {STATUS_LABELS[ticket.status] || ticket.status}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 1. DADOS DO CHAMADO */}
                <Text style={styles.sectionTitle}>1. Dados do Chamado</Text>
                <View style={styles.divider}/>
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Solicitante</Text>
                        <Text style={styles.infoValue}>{requesterName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Secretaria / Departamento</Text>
                        <Text style={styles.infoValue}>{departName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Categoria</Text>
                        <Text style={styles.infoValue}>{categoryName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Prioridade</Text>
                        <Text style={[styles.infoValue, { color: PRIORITY_COLORS[ticket.priority] || '#111' }]}>
                            {ticket.priority || '—'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Localização</Text>
                        <Text style={styles.infoValueNormal}>{safe(ticket.location) || 'Não informada'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Técnico responsável</Text>
                        <Text style={styles.infoValue}>{assignedName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Abertura</Text>
                        <Text style={styles.infoValueNormal}>{fmt(ticket.createdAt)}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Última atualização</Text>
                        <Text style={styles.infoValueNormal}>{fmt(ticket.updatedAt)}</Text>
                    </View>
                </View>

                {/* 2. DESCRIÇÃO */}
                <Text style={styles.sectionTitle}>2. Descrição do Problema</Text>
                <View style={styles.divider}/>
                <View style={styles.descBox}>
                    <Text style={styles.subjectText}>{safe(ticket.subject)}</Text>
                    {ticket.description && (
                        <Text style={styles.descText}>"{ticket.description}"</Text>
                    )}
                </View>

                {/* 3. HISTÓRICO */}
                <Text style={styles.sectionTitle}>3. Histórico de Eventos</Text>
                <View style={styles.divider}/>

                <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]}/>
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Chamado aberto</Text>
                        <Text style={styles.timelineSub}>Por: {requesterName}</Text>
                        <Text style={styles.timelineTime}>{fmt(ticket.createdAt)}</Text>
                    </View>
                </View>

                {ticket.assignedTo?.name && (
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: '#3b82f6' }]}/>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Técnico atribuído</Text>
                            <Text style={styles.timelineSub}>Responsável: {ticket.assignedTo.name}</Text>
                        </View>
                    </View>
                )}

                {visitasLog.map((v: any, i: number) => (
                    <View key={i} style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: '#8b5cf6' }]}/>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Visita agendada</Text>
                            <Text style={styles.timelineSub}>{v.content.replace('[VISITA] ', '')}</Text>
                            <Text style={styles.timelineTime}>{fmt(v.createdAt)}</Text>
                        </View>
                    </View>
                ))}

                {fotosAnexadas.length > 0 && (
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: '#06b6d4' }]}/>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>
                                {fotosAnexadas.length} foto{fotosAnexadas.length > 1 ? 's' : ''} anexada{fotosAnexadas.length > 1 ? 's' : ''}
                            </Text>
                            <Text style={styles.timelineSub}>
                                Por: {[...new Set(fotosAnexadas.map((f: any) => f.user?.name).filter(Boolean))].join(', ') || '—'}
                            </Text>
                        </View>
                    </View>
                )}

                {notasInternas.length > 0 && (
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]}/>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>
                                {notasInternas.length} nota{notasInternas.length > 1 ? 's' : ''} técnica{notasInternas.length > 1 ? 's' : ''} registrada{notasInternas.length > 1 ? 's' : ''}
                            </Text>
                            <Text style={styles.timelineSub}>Anotações internas da equipe</Text>
                        </View>
                    </View>
                )}

                {isConcluido && (
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: '#10b981' }]}/>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Chamado concluído</Text>
                            <Text style={styles.timelineSub}>Por: {assignedName}</Text>
                            <Text style={styles.timelineTime}>{fmt(ticket.updatedAt)}</Text>
                        </View>
                    </View>
                )}

                {/* 4. REGISTRO DE ATENDIMENTO */}
                {comentariosPublicos.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>4. Registro de Atendimento</Text>
                        <View style={styles.divider}/>
                        {comentariosPublicos.slice(0, 8).map((c: any, i: number) => (
                            <View key={i} style={styles.commentBox}>
                                <Text style={styles.commentAuthor}>
                                    {safe(c.user?.name)} · {c.user?.role || ''} · {fmt(c.createdAt)}
                                </Text>
                                <Text style={styles.commentText}>{c.content}</Text>
                            </View>
                        ))}
                        {comentariosPublicos.length > 8 && (
                            <Text style={[styles.footerText, { marginTop: 4 }]}>
                                + {comentariosPublicos.length - 8} mensagens adicionais não exibidas.
                            </Text>
                        )}
                    </>
                )}

                {/* 5. VISITA TÉCNICA */}
                {ticket.visitDate && (
                    <>
                        <Text style={styles.sectionTitle}>5. Visita Técnica Agendada</Text>
                        <View style={styles.divider}/>
                        <View style={styles.visitBox}>
                            <Text style={styles.visitLabel}>Data e hora da visita</Text>
                            <Text style={styles.visitDate}>{fmt(ticket.visitDate)}</Text>
                            {ticket.visitNote && (
                                <Text style={styles.visitNote}>{ticket.visitNote}</Text>
                            )}
                        </View>
                    </>
                )}

                {/* 6. ASSINATURAS — só no concluído */}
                {isConcluido && (
                    <>
                        <Text style={styles.sectionTitle}>6. Confirmação de Atendimento</Text>
                        <View style={styles.divider}/>
                        <View style={styles.signatureBox}>
                            <View style={styles.signature}>
                                <Text style={styles.signatureLabel}>Assinatura do Técnico</Text>
                                <Text style={styles.signatureName}>{assignedName}</Text>
                            </View>
                            <View style={styles.signature}>
                                <Text style={styles.signatureLabel}>Assinatura do Solicitante</Text>
                                <Text style={styles.signatureName}>{requesterName}</Text>
                            </View>
                        </View>
                    </>
                )}

                {/* RODAPÉ */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>{sysName}{sysCity ? ` · ${sysCity}` : ''}</Text>
                    <Text style={styles.footerText}>Protocolo {ticket.protocol} · {fmtDate(new Date())}</Text>
                </View>

            </Page>
        </Document>
    );
};