import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, MapPin, Phone, Mail, Clock } from 'lucide-react';

const About = () => {
  const team = [
    {
      name: 'Carlos Rodríguez',
      position: 'Director General',
      photo: '/team/carlos.jpg',
      description: 'Más de 15 años de experiencia en el sector automotriz.'
    },
    {
      name: 'María González',
      position: 'Gerente de Ventas',
      photo: '/team/maria.jpg',
      description: 'Especialista en atención al cliente y financiación.'
    },
    {
      name: 'Roberto Silva',
      position: 'Asesor Comercial',
      photo: '/team/roberto.jpg',
      description: 'Experto en vehículos premium y usados certificados.'
    },
    {
      name: 'Ana Martínez',
      position: 'Asesora Comercial',
      photo: '/team/ana.jpg',
      description: 'Especializada en vehículos nuevos y financiación.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Vehículos Vendidos' },
    { number: '15+', label: 'Años de Experiencia' },
    { number: '1000+', label: 'Clientes Satisfechos' },
    { number: '50+', label: 'Marcas Representadas' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sobre Ricars Automóviles
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Tu concesionaria de confianza con más de 15 años de experiencia 
              en la venta de vehículos nuevos y usados.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Historia */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Ricars Automóviles nació en 2008 con la visión de ofrecer una experiencia 
                  diferente en la compra de vehículos. Fundada por Carlos Rodríguez, un 
                  apasionado del mundo automotriz, la empresa comenzó como un pequeño 
                  concesionario en el corazón de Buenos Aires.
                </p>
                <p>
                  A lo largo de estos años, hemos crecido de manera sostenible, siempre 
                  manteniendo nuestros valores fundamentales: transparencia, honestidad y 
                  compromiso con el cliente. Hoy somos una de las concesionarias más 
                  respetadas de la región.
                </p>
                <p>
                  Nuestro equipo de profesionales altamente capacitados está dedicado a 
                  brindar el mejor asesoramiento y acompañamiento durante todo el proceso 
                  de compra, desde la selección del vehículo hasta la entrega y el 
                  servicio post-venta.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">R</span>
                  </div>
                  <p className="text-gray-500">Video del local</p>
                  <p className="text-sm text-gray-400">(Aquí iría el video)</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Números que Hablan
            </h2>
            <p className="text-lg text-gray-600">
              Nuestro compromiso con la excelencia se refleja en nuestras estadísticas
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-lg text-gray-600">
              Los principios que guían nuestro trabajo diario
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Excelencia
              </h3>
              <p className="text-gray-600">
                Nos esforzamos por ofrecer el mejor servicio y la mejor calidad 
                en cada interacción con nuestros clientes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Confianza
              </h3>
              <p className="text-gray-600">
                Construimos relaciones duraderas basadas en la transparencia, 
                honestidad y compromiso con nuestros clientes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Innovación
              </h3>
              <p className="text-gray-600">
                Nos mantenemos actualizados con las últimas tecnologías y 
                tendencias del mercado automotriz.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-lg text-gray-600">
              Profesionales dedicados a brindarte la mejor experiencia
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-gray-200 rounded-lg h-48 mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-xl">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">Foto de {member.name}</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-2">
                  {member.position}
                </p>
                <p className="text-sm text-gray-600">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Información de contacto */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Visítanos
            </h2>
            <p className="text-lg text-gray-600">
              Te esperamos en nuestro local para mostrarte nuestra amplia selección
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dirección
              </h3>
              <p className="text-gray-600">
                Av. Principal 123<br />
                CABA, Buenos Aires<br />
                Argentina
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Teléfono
              </h3>
              <p className="text-gray-600">
                +54 11 1234-5678<br />
                +54 11 1234-5679
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Horarios
              </h3>
              <p className="text-gray-600">
                Lunes a Viernes: 9:00 - 18:00<br />
                Sábados: 9:00 - 13:00<br />
                Domingos: Cerrado
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
