  import React from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';

const NuevoClienteScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>NUEVO CLIENTE</Text>
      </View>

      {/* Imagen */}
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }} // Reemplaza con la URL de la imagen real
        style={styles.image}
      />

      {/* Campos de texto */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre:</Text>
        <TextInput style={styles.input} placeholder="Escribe el nombre" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Teléfono:</Text>
        <TextInput style={styles.input} placeholder="Escribe el teléfono" keyboardType="phone-pad" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ubicación:</Text>
        <TextInput style={styles.input} placeholder="Escribe la ubicación" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tipo de servicio:</Text>
        <TextInput style={styles.input} placeholder="Escribe el tipo de servicio" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descripción del trabajo:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Escribe la descripción del trabajo"
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha:</Text>
        <TextInput style={styles.input} placeholder="Selecciona la fecha" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Hora del servicio:</Text>
        <TextInput style={styles.input} placeholder="Selecciona la hora" />
      </View>

      {/* Botón */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Aplicar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginVertical: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 16,
    marginBottom: 16,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#c41c1c',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NuevoClienteScreen;
    