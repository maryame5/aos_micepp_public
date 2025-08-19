import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('fr');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private readonly LANGUAGE_KEY = 'aos_language';

  constructor(private translate: TranslateService) {
    try {
      this.initializeLanguage();
    } catch (error) {
      console.error('Error initializing language service:', error);
      // Fallback to French
      this.currentLanguageSubject.next('fr');
    }
  }

  private initializeLanguage(): void {
    try {
      const savedLanguage = localStorage.getItem(this.LANGUAGE_KEY) || 'fr';
      this.setLanguage(savedLanguage);
    } catch (error) {
      console.error('Error initializing language:', error);
      this.currentLanguageSubject.next('fr');
    }
  }

  setLanguage(language: string): void {
    try {
      this.translate.use(language);
      this.currentLanguageSubject.next(language);
      localStorage.setItem(this.LANGUAGE_KEY, language);
      
      // Set document direction for RTL languages
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    } catch (error) {
      console.error('Error setting language:', error);
      // Fallback to French
      this.currentLanguageSubject.next('fr');
    }
  }

  getCurrentLanguage(): string {
    try {
      return this.currentLanguageSubject.value;
    } catch (error) {
      console.error('Error getting current language:', error);
      return 'fr';
    }
  }

  isRTL(): boolean {
    try {
      return this.getCurrentLanguage() === 'ar';
    } catch (error) {
      console.error('Error checking RTL:', error);
      return false;
    }
  }

  getAvailableLanguages(): Array<{code: string, name: string, flag: string}> {
    try {
      return [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ar', name: 'العربية', flag: '🇲🇦' }
      ];
    } catch (error) {
      console.error('Error getting available languages:', error);
      return [
        { code: 'fr', name: 'Français', flag: '🇫🇷' }
      ];
    }
  }
}