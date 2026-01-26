#!/usr/bin/env python3
"""
Script para capturar screenshots reais do app usando Expo CLI
Requer: Expo CLI instalado e iOS Simulator

Uso: python capture_app_screenshots.py
"""

import os
import subprocess
import time
import sys
from pathlib import Path

def run_command(command, cwd=None):
    """Executa um comando e retorna o resultado"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True, timeout=30)
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def main():
    """Função principal"""
    print("📱 Capturando screenshots reais do GoDrive...")
    print("🎯 Alvo: iPad Pro (13 polegadas) - 2048x2732 pixels")
    print()
    
    # Caminho do projeto
    project_path = Path(__file__).parent.parent
    screenshots_path = Path(__file__).parent
    
    print(f"📁 Projeto: {project_path}")
    print(f"📁 Screenshots: {screenshots_path}")
    print()
    
    # 1. Iniciar o servidor Expo
    print("🚀 Iniciando servidor Expo...")
    success, stdout, stderr = run_command("npx expo start --web", project_path)
    
    if not success:
        print("❌ Erro ao iniciar o servidor Expo:")
        print(stderr)
        return False
    
    print("✅ Servidor Expo iniciado")
    print("🌐 URL: http://localhost:8082")
    print()
    
    # 2. Abrir no iOS Simulator
    print("📱 Abrindo app no iOS Simulator...")
    
    # Esperar um pouco para o servidor iniciar
    time.sleep(5)
    
    # Tentar abrir no iOS Simulator
    success, stdout, stderr = run_command("npx expo run:ios", project_path)
    
    if not success:
        print("⚠️  Não foi possível abrir automaticamente no iOS Simulator")
        print("📋 Instruções manuais:")
        print("   1. Abra o iOS Simulator")
        print("   2. Escaneie o QR code com o app Expo Go")
        print("   3. Ou pressione 'i' no terminal para abrir no simulador")
    else:
        print("✅ App aberto no iOS Simulator")
    
    print()
    print("📸 Instruções para capturar screenshots:")
    print()
    print("1. Navegue até as seguintes telas no app:")
    print("   • Home (dashboard principal)")
    print("   • Perfil → Editar Perfil")
    print("   • Configurações → Privacidade e Segurança → SAC")
    print()
    print("2. Para capturar screenshots no iOS Simulator:")
    print("   • Cmd + Shift + 4: Selecionar área")
    print("   • Cmd + Shift + 3: Tela inteira")
    print()
    print("3. Salve os arquivos na pasta:")
    print(f"   {screenshots_path}")
    print()
    print("4. Nomes recomendados:")
    print("   • ipad_home_2048x2732.png")
    print("   • ipad_profile_2048x2732.png")
    print("   • ipad_sac_2048x2732.png")
    print()
    print("5. Após capturar, use um editor de imagens para:")
    print("   • Redimensionar para 2048x2732 pixels")
    print("   • Remover molduras do simulador")
    print("   • Garantir alta qualidade")
    print()
    print("🔄 O servidor Expo continuará rodando...")
    print("🛑 Pressione Ctrl+C para parar quando terminar")
    
    # Manter o servidor rodando
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Encerrando servidor Expo...")
        return True

if __name__ == "__main__":
    main()
