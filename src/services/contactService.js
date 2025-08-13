import { supabase } from '../supabase/config';

export const contactService = {
  // Enviar mensaje de contacto (usuarios no autenticados)
  async sendContactMessage(messageData) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([messageData])
        .select();

      if (error) {
        console.error('❌ Error enviando mensaje de contacto:', error);
        throw error;
      }

      console.log('✅ Mensaje de contacto enviado:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error en sendContactMessage:', error);
      throw error;
    }
  },

  // Obtener mensajes de contacto (solo admins)
  async getContactMessages() {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo mensajes de contacto:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error en getContactMessages:', error);
      throw error;
    }
  },

  // Actualizar estado de mensaje (solo admins)
  async updateMessageStatus(messageId, status) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', messageId)
        .select();

      if (error) {
        console.error('❌ Error actualizando estado del mensaje:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('❌ Error en updateMessageStatus:', error);
      throw error;
    }
  },

  // Eliminar mensaje (solo admins)
  async deleteMessage(messageId) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('❌ Error eliminando mensaje:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error en deleteMessage:', error);
      throw error;
    }
  }
};
