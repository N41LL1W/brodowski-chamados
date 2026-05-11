import {
    Document, Page, Text, View, StyleSheet
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page:        { padding: 36, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' },
    header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2 solid #111', paddingBottom: 12, marginBottom: 16 },
    headerLeft:  { flex: 1 },
    systemName:  { fontSize: 18, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },
    systemSub:   { fontSize: 8, color: '#666', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    protocolBox: { backgroundColor: '#111', color: '#fff', padding: '6 12', borderRadius: 4, textAlign: 'right' },
    protocolLabel:{ fontSize: 7, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
    protocolNum: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#fff', marginTop: 2 },

    sectionTitle:{ fontSize: 7, textTransform: 'uppercase', letterSpacing: 1, color: '#2563eb', marginBottom: 6, marginTop: 14, fontFamily: 'Helvetica-Bold' },
    divider:     { borderBottom: '0.5 solid #e5e7eb', marginBottom: 8 },

    row:         { flexDirection: 'row', gap: 12, marginBottom: 8 },
    field:       { flex: 1 },
    label:       { fontSize: 7, color: '#888', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
    value:       { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111' },
    valueNormal: { fontSize: 10, color: '#333' },

    descBox:     { backgroundColor: '#f9fafb', padding: '8 10', borderRadius: 4, borderLeft: '3 solid #2563eb', marginBottom: 8 },
    descText:    { fontSize: 10, color: '#333', lineHeight: 1.5, fontStyle: 'italic' },

    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
    statusText:  { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },

    timelineItem:{ flexDirection: 'row', gap: 10, marginBottom: 8 },
    timelineDot: { width: 6, height: 6, borderRadius: 3, marginTop: 3, flexShrink: 0 },
    timelineContent:{ flex: 1 },
    timelineTitle:{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111' },
    timelineSub: { fontSize: 8, color: '#666', marginTop: 1 },
    timelineTime:{ fontSize: 7, color: '#999', marginTop: 1 },

    commentBox:  { backgroundColor: '#f9fafb', padding: '6 8', borderRadius: 4, marginBottom: 4, borderLeft: '2 solid #e5e7eb' },
    commentInterno: { backgroundColor: '#fffbeb', borderLeft: '2 solid #f59e0b' },
    commentAuthor:{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#555', marginBottom: 2 },
    commentText: { fontSize: 9, color: '#333' },

    footer:      { position: 'absolute', bottom: 24, left: 36, right: 36, borderTop: '0.5 solid #e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerText:  { fontSize: 7, color: '#aaa' },

    infoGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    infoItem:    { width: '48%' },

    signatureBox:{ flexDirection: 'row', gap: 20, marginTop: 16 },
    signature:   { flex: 1, borderTop: '0.5 solid #111', paddingTop: 6 },
    signatureLabel:{ fontSize: 7, color: '#888', textAlign: 'center' },
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

function formatDate(d: any) {
    if (!d) return '—';
    return new Date(d).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatDateShort(d: any) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('pt-BR');
}

export const TicketPDF = ({ ticket }: { ticket: any }) => {
    const statusStyle = STATUS_COLORS[ticket.status] || { bg: '#f3f4f6', text: '#374151' };
    const isConcluido = ['CONCLUIDO', 'CONCLUDED'].includes(ticket.status);

    // Filtra comentários públicos (não internos, não visita, não foto sozinha)
    const comentariosPublicos = ticket.comments?.filter((c: any) =>
        !c.content.startsWith('[VISITA]') &&
        !c.content.includes('[INTERNO]') &&
        c.content !== 'Foto anexada ao chamado.' &&
        c.content !== 'Foto anexada na abertura do chamado.'
    ) || [];

    // Notas internas
    const notasInternas = ticket.comments?.filter((c: any) =>
        c.content.includes('[INTERNO]') && !c.content.startsWith('[VISITA]')
    ) || [];

    // Fotos mencionadas
    const fotosAnexadas = ticket.comments?.filter((c: any) => c.proofImage) || [];

    // Visitas agendadas
    const visitasLog = ticket.comments?.filter((c: any) => c.content.startsWith('[VISITA]')) || [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* CABEÇALHO */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.systemName}>TI Brodowski</Text>
                        <Text style={styles.systemSub}>Central de Chamados Técnicos — Prefeitura Municipal</Text>
                        <Text style={[styles.systemSub, { marginTop: 4 }]}>
                            Emitido em: {formatDate(new Date())}
                        </Text>
                    </View>
                    <View style={styles.protocolBox}>
                        <Text style={styles.protocolLabel}>Protocolo</Text>
                        <Text style={styles.protocolNum}>{ticket.protocol}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, marginTop: 6 }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                {STATUS_LABELS[ticket.status] || ticket.status}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* DADOS DO CHAMADO */}
                <Text style={styles.sectionTitle}>1. Dados do Chamado</Text>
                <View style={styles.divider}/>

                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Solicitante</Text>
                        <Text style={styles.value}>{ticket.requester?.name || ticket.requesterId || '—'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Secretaria / Departamento</Text>
                        <Text style={styles.value}>{ticket.department?.name || '—'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Categoria</Text>
                        <Text style={styles.value}>{ticket.category?.name || '—'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Prioridade</Text>
                        <Text style={[styles.value, { color: PRIORITY_COLORS[ticket.priority] || '#111' }]}>
                            {ticket.priority}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Localização</Text>
                        <Text style={styles.valueNormal}>{ticket.location || 'Não informada'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Técnico responsável</Text>
                        <Text style={styles.value}>{ticket.assignedTo?.name || 'Não atribuído'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Abertura</Text>
                        <Text style={styles.valueNormal}>{formatDate(ticket.createdAt)}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Última atualização</Text>
                        <Text style={styles.valueNormal}>{formatDate(ticket.updatedAt)}</Text>
                    </View>
                </View>

                {/* ASSUNTO E DESCRIÇÃO */}
                <Text style={styles.sectionTitle}>2. Descrição do Problema</Text>
                <View style={styles.divider}/>
                <Text style={[styles.value, { marginBottom: 6 }]}>{ticket.subject}</Text>
                {ticket.description && (
                    <View style={styles.descBox}>
                        <Text style={styles.descText}>"{ticket.description}"</Text>
                    </View>
                )}

                {/* TIMELINE DE EVENTOS */}
                <Text style={styles.sectionTitle}>3. Histórico de Eventos</Text>
                <View style={styles.divider}/>

                {/* Evento: Abertura */}
                <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]}/>
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Chamado aberto</Text>
                        <Text style={styles.timelineSub}>Por: {ticket.requester?.name || '—'}</Text>
                        <Text style={styles.timelineTime}>{formatDate(ticket.createdAt)}</Text>
                    </View>
                </View>

                {/* Evento: Atribuição */}
                {ticket.assignedTo && (
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: '#3b82f6' }]}/>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Técnico atribuído</Text>
                            <Text style={styles.timelineSub}>Responsável: {ticket.assignedTo.name}</Text>
                        </View>
                    </View>
                )}

                {/* Eventos: Visitas */}
                {visitasLog.map((v: any, i: number) => (
                    <View key={i} style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: '#8b5cf6' }]}/>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Visita agendada</Text>
                            <Text style={styles.timelineSub}>{v.content.replace('[VISITA] ', '')}</Text>
                            <Text style={styles.timelineTime}>{formatDate(v.createdAt)}</Text>
                        </View>
                    </View>
                ))}

                {/* Evento: Fotos */}
                {fotosAnexadas.length > 0 && (
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: '#06b6d4' }]}/>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>
                                {fotosAnexadas.length} foto{fotosAnexadas.length > 1 ? 's' : ''} anexada{fotosAnexadas.length > 1 ? 's' : ''}
                            </Text>
                            <Text style={styles.timelineSub}>
                                Evidências registradas por: {[...new Set(fotosAnexadas.map((f: any) => f.user?.name))].filter(Boolean).join(', ')}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Evento: Notas internas */}
                {notasInternas.length > 0 && (
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]}/>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>{notasInternas.length} nota{notasInternas.length > 1 ? 's' : ''} técnica{notasInternas.length > 1 ? 's' : ''} registrada{notasInternas.length > 1 ? 's' : ''}</Text>
                            <Text style={styles.timelineSub}>Anotações internas da equipe técnica</Text>
                        </View>
                    </View>
                )}

                {/* Evento: Conclusão */}
                {isConcluido && (
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: '#10b981' }]}/>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Chamado concluído</Text>
                            <Text style={styles.timelineSub}>
                                Por: {ticket.assignedTo?.name || '—'}
                            </Text>
                            <Text style={styles.timelineTime}>{formatDate(ticket.updatedAt)}</Text>
                        </View>
                    </View>
                )}

                {/* INTERAÇÕES PÚBLICAS */}
                {comentariosPublicos.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>4. Registro de Atendimento</Text>
                        <View style={styles.divider}/>
                        {comentariosPublicos.slice(0, 8).map((c: any, i: number) => (
                            <View key={i} style={styles.commentBox}>
                                <Text style={styles.commentAuthor}>
                                    {c.user?.name || '—'} · {c.user?.role || ''} · {formatDate(c.createdAt)}
                                </Text>
                                <Text style={styles.commentText}>{c.content}</Text>
                            </View>
                        ))}
                        {comentariosPublicos.length > 8 && (
                            <Text style={[styles.footerText, { marginTop: 4 }]}>
                                + {comentariosPublicos.length - 8} mensagens não exibidas neste comprovante.
                            </Text>
                        )}
                    </>
                )}

                {/* VISITA AGENDADA */}
                {ticket.visitDate && (
                    <>
                        <Text style={styles.sectionTitle}>5. Visita Técnica Agendada</Text>
                        <View style={styles.divider}/>
                        <View style={styles.row}>
                            <View style={styles.field}>
                                <Text style={styles.label}>Data e hora</Text>
                                <Text style={styles.value}>{formatDate(ticket.visitDate)}</Text>
                            </View>
                            {ticket.visitNote && (
                                <View style={[styles.field, { flex: 2 }]}>
                                    <Text style={styles.label}>Observação</Text>
                                    <Text style={styles.valueNormal}>{ticket.visitNote}</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}

                {/* ASSINATURAS — só no comprovante final */}
                {isConcluido && (
                    <>
                        <Text style={styles.sectionTitle}>6. Confirmação de Atendimento</Text>
                        <View style={styles.divider}/>
                        <View style={styles.signatureBox}>
                            <View style={styles.signature}>
                                <Text style={styles.signatureLabel}>Assinatura do Técnico</Text>
                                <Text style={[styles.signatureLabel, { marginTop: 2 }]}>{ticket.assignedTo?.name || '____________________'}</Text>
                            </View>
                            <View style={styles.signature}>
                                <Text style={styles.signatureLabel}>Assinatura do Solicitante</Text>
                                <Text style={[styles.signatureLabel, { marginTop: 2 }]}>{ticket.requester?.name || '____________________'}</Text>
                            </View>
                        </View>
                    </>
                )}

                {/* RODAPÉ */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Brodowski, SP · Prefeitura Municipal · TI Brodowski
                    </Text>
                    <Text style={styles.footerText}>
                        Protocolo {ticket.protocol} · {formatDateShort(new Date())}
                    </Text>
                </View>

            </Page>
        </Document>
    );
};