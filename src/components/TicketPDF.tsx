import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilização para o PDF (parecido com CSS)
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { borderBottom: 1, borderBottomColor: '#111', pb: 10, mb: 20, textAlign: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase' },
  section: { mb: 15 },
  label: { fontSize: 10, color: '#666', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 14, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', mb: 15 },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', borderTop: 1, pt: 10, color: '#999', fontSize: 10 }
});

export const TicketPDF = ({ ticket }: { ticket: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>TI BRODOWSKI</Text>
        <Text>Comprovante de Registro de Chamado</Text>
      </View>

      {/* Protocolo e Data */}
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Protocolo</Text>
          <Text style={[styles.value, { color: '#1d4ed8' }]}>{ticket.protocol}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.label}>Data/Hora</Text>
          <Text style={styles.value}>{new Date(ticket.createdAt).toLocaleString('pt-BR')}</Text>
        </View>
      </View>

      {/* Conteúdo */}
      <View style={styles.section}>
        <Text style={styles.label}>Assunto</Text>
        <Text style={styles.value}>{ticket.subject}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Descrição</Text>
        <Text>{ticket.description}</Text>
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Localização</Text>
          <Text style={styles.value}>{ticket.location}</Text>
        </View>
        <View>
          <Text style={styles.label}>Prioridade</Text>
          <Text style={styles.value}>{ticket.priority}</Text>
        </View>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text>Brodowski, SP - {new Date().toLocaleDateString('pt-BR')}</Text>
        <Text>Este documento é um comprovante digital de abertura de chamado técnico.</Text>
      </View>
    </Page>
  </Document>
);