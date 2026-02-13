import React, { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    doctorTheme: Theme;
    patientTheme: Theme;
    setDoctorTheme: (theme: Theme) => void;
    setPatientTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [doctorTheme, setDoctorThemeState] = useState<Theme>(
        (localStorage.getItem('doctorTheme') as Theme) || 'dark'
    );
    const [patientTheme, setPatientThemeState] = useState<Theme>(
        (localStorage.getItem('patientTheme') as Theme) || 'light'
    );

    const setDoctorTheme = (theme: Theme) => {
        setDoctorThemeState(theme);
        localStorage.setItem('doctorTheme', theme);
    };

    const setPatientTheme = (theme: Theme) => {
        setPatientThemeState(theme);
        localStorage.setItem('patientTheme', theme);
    };

    return (
        <ThemeContext.Provider value={{ doctorTheme, patientTheme, setDoctorTheme, setPatientTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
