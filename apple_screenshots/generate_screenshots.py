#!/usr/bin/env python3
"""
Script para gerar capturas de tela do iPad (13 polegadas) - 2048x2732 pixels
Requer: pip install selenium webdriver-manager

Uso: python generate_screenshots.py
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def setup_driver():
    """Configura o Chrome WebDriver para capturas de tela em alta resolução"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Executar em modo headless
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=2048,2732')
    
    # Configurações para alta qualidade
    prefs = {
        "profile.default_content_setting_values.notifications": 2,
        "profile.default_content_settings.popups": 0,
        "download.prompt_for_download": False,
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )
    
    return driver

def capture_screenshot(driver, html_file, output_file):
    """Captura screenshot de um arquivo HTML"""
    # Caminho completo para o arquivo HTML
    html_path = os.path.abspath(html_file)
    
    # Abrir o arquivo HTML
    driver.get(f"file://{html_path}")
    
    # Esperar a página carregar completamente
    time.sleep(3)
    
    # Ajustar o tamanho da janela para o tamanho do iPad
    driver.set_window_size(2048, 2732)
    
    # Esperar um pouco mais para garantir que tudo esteja renderizado
    time.sleep(2)
    
    # Capturar screenshot
    driver.save_screenshot(output_file)
    
    print(f"✅ Screenshot salvo: {output_file}")

def main():
    """Função principal"""
    print("🎨 Gerando capturas de tela para iPad (13 polegadas)...")
    print("📏 Dimensões: 2048 x 2732 pixels")
    print("📁 Pasta: apple_screenshots")
    print()
    
    # Configurar o driver
    print("🔧 Configurando Chrome WebDriver...")
    driver = setup_driver()
    
    try:
        # Lista de telas para capturar
        screenshots = [
            ("ipad_home.html", "ipad_home_2048x2732.png"),
            ("ipad_profile.html", "ipad_profile_2048x2732.png"),
            ("ipad_sac.html", "ipad_sac_2048x2732.png")
        ]
        
        # Gerar cada screenshot
        for html_file, png_file in screenshots:
            print(f"📸 Capturando: {html_file} → {png_file}")
            capture_screenshot(driver, html_file, png_file)
            print()
        
        print("✅ Todas as capturas de tela foram geradas com sucesso!")
        print()
        print("📋 Arquivos criados:")
        for _, png_file in screenshots:
            print(f"   📄 {png_file}")
        print()
        print("🚀 Pronto para upload na App Store Connect!")
        
    except Exception as e:
        print(f"❌ Erro ao gerar screenshots: {e}")
    
    finally:
        # Fechar o driver
        driver.quit()

if __name__ == "__main__":
    main()
