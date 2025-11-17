"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { VerticalCutReveal, VerticalCutRevealRef } from "@/components/ui/vertical-cut-reveal";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function onlyDigits(v: string) { return v.replace(/\D/g, ""); }

function isValidCPF(cpf: string) {
  const s = onlyDigits(cpf);
  if (s.length !== 11 || /^([0-9])\1+$/.test(s)) return false;
  const calc = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * (factor - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  const d1 = calc(s.slice(0, 9), 10);
  const d2 = calc(s.slice(0, 10), 11);
  return d1 === parseInt(s[9], 10) && d2 === parseInt(s[10], 10);
}

async function fetchCEPData(cep: string): Promise<{
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
} | null> {
  try {
    const cleanCEP = onlyDigits(cep);
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();
    
    if (data.erro) return null;
    
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || ''
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

function formatCPF(v: string) {
  const s = onlyDigits(v);
  return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
function formatPhone(v: string) {
  const s = onlyDigits(v);
  if (s.length <= 10) return s.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return s.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}
function formatCEP(v: string) {
  const s = onlyDigits(v);
  return s.replace(/(\d{5})(\d{0,3})/, "$1-$2");
}

interface Question {
  id: string;
  type: 'text' | 'email' | 'tel' | 'cpf' | 'cep';
  label: string;
  placeholder: string;
  validation: (value: string) => boolean;
  errorMessage: string;
  animationText: string;
}

const questions: Question[] = [
  {
    id: 'welcome',
    type: 'text',
    label: '',
    placeholder: '',
    validation: () => true,
    errorMessage: '',
    animationText: "É um prazer ter você aqui na Café Canastra!"
  },
  {
    id: 'full_name',
    type: 'text',
    label: 'Nome completo',
    placeholder: 'Digite seu nome completo',
    validation: (value) => value.trim().length >= 3,
    errorMessage: 'Nome completo obrigatório',
    animationText: "Qual é o seu nome?"
  },
  {
    id: 'email',
    type: 'email',
    label: 'E-mail',
    placeholder: 'Digite seu e-mail',
    validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    errorMessage: 'E-mail inválido',
    animationText: "Seu e-mail para contato?"
  },
  {
    id: 'phone',
    type: 'tel',
    label: 'Telefone',
    placeholder: 'Digite seu telefone',
    validation: (value) => onlyDigits(value).length >= 10,
    errorMessage: 'Telefone inválido',
    animationText: "Qual é o seu telefone?"
  },
  {
    id: 'cpf',
    type: 'cpf',
    label: 'CPF',
    placeholder: 'Digite seu CPF',
    validation: (value) => isValidCPF(value),
    errorMessage: 'CPF inválido',
    animationText: "Seu CPF para o pedido?"
  },

  {
    id: 'postal_code',
    type: 'cep',
    label: 'CEP',
    placeholder: 'Digite seu CEP',
    validation: (value) => /^\d{5}-?\d{3}$/.test(value),
    errorMessage: 'CEP inválido',
    animationText: "Qual é o CEP de entrega?"
  },
  {
    id: 'address_line1',
    type: 'text',
    label: 'Endereço',
    placeholder: 'Rua, Avenida, etc',
    validation: (value) => value.trim().length >= 5,
    errorMessage: 'Endereço obrigatório',
    animationText: "O endereço de entrega?"
  },
  {
    id: 'number',
    type: 'text',
    label: 'Número',
    placeholder: 'Número da casa/apartamento',
    validation: (value) => value.trim().length >= 1,
    errorMessage: 'Número obrigatório',
    animationText: "O número do endereço?"
  },
  {
    id: 'district',
    type: 'text',
    label: 'Bairro',
    placeholder: 'Digite o bairro',
    validation: (value) => value.trim().length >= 3,
    errorMessage: 'Bairro obrigatório',
    animationText: "Qual é o bairro?"
  },
  {
    id: 'city',
    type: 'text',
    label: 'Cidade',
    placeholder: 'Digite a cidade',
    validation: (value) => value.trim().length >= 3,
    errorMessage: 'Cidade obrigatória',
    animationText: "A cidade de entrega?"
  },
  {
    id: 'state',
    type: 'text',
    label: 'Estado',
    placeholder: 'Digite o estado',
    validation: (value) => value.trim().length >= 2,
    errorMessage: 'Estado obrigatório',
    animationText: "O estado?"
  },
  {
    id: 'address_line2',
    type: 'text',
    label: 'Complemento',
    placeholder: 'Complemento (opcional)',
    validation: () => true,
    errorMessage: '',
    animationText: "Algum complemento?"
  }
];

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = (searchParams.get("code") || "").trim();
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const revealRef = useRef<VerticalCutRevealRef>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    cpf: "",
    address_line1: "",
    address_line2: "",
    number: "",
    district: "",
    city: "",
    state: "",
    postal_code: "",
  });

  const currentQuestion = questions[currentQuestionIndex];

  const formatInputValue = (value: string, type: string) => {
    switch (type) {
      case 'cpf':
        return formatCPF(value);
      case 'tel':
        return formatPhone(value);
      case 'cep':
        return formatCEP(value);
      default:
        return value;
    }
  };

  const handleCEPSearch = async (cep: string) => {
    setLoading(true);
    try {
      const cepData = await fetchCEPData(cep);
      if (cepData) {
        // Atualizar os campos do formulário com os dados do CEP
        setFormData(prev => ({
          ...prev,
          address_line1: cepData.logradouro,
          district: cepData.bairro,
          city: cepData.localidade,
          state: cepData.uf
        }));
        
        // Se já estivermos na etapa de CEP, mostrar mensagem de sucesso
        if (currentQuestion.id === 'postal_code') {
          setSuccessMessage("CEP encontrado! Endereço preenchido automaticamente.");
          setTimeout(() => setSuccessMessage(""), 3000);
        }
      } else {
        setError("CEP não encontrado. Por favor, preencha o endereço manualmente.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setError("Erro ao buscar CEP. Por favor, preencha o endereço manualmente.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatInputValue(value, currentQuestion.id === 'cpf' ? 'cpf' : currentQuestion.id === 'phone' ? 'tel' : currentQuestion.id === 'postal_code' ? 'cep' : currentQuestion.type);
    setInputValue(formattedValue);
    setError("");
    setSuccessMessage("");
    
    // Buscar CEP automaticamente quando o CEP estiver completo
    if (currentQuestion.id === 'postal_code' && onlyDigits(value).length === 8) {
      handleCEPSearch(onlyDigits(value));
    }
  };

  const handleNext = async () => {
    if (currentQuestion.id === 'welcome') {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setCurrentQuestionIndex(1);
        setIsAnimatingOut(false);
        // Animation will be triggered by useEffect
      }, 500);
      return;
    }

    if (!currentQuestion.validation(inputValue)) {
      setError(currentQuestion.errorMessage);
      return;
    }

    // Update form data
    if (currentQuestion.id !== 'welcome') {
      setFormData(prev => ({
        ...prev,
        [currentQuestion.id]: inputValue
      }));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setIsAnimatingOut(true);
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        
        // Se o próximo campo já estiver preenchido (ex: pelo CEP), pular para o próximo vazio
        const nextQuestion = questions[nextIndex];
        const nextValue = formData[nextQuestion.id as keyof typeof formData] || "";
        
        if (nextValue && nextIndex < questions.length - 1) {
          // Se já tem valor e não é o último campo, ir para o próximo
          setCurrentQuestionIndex(nextIndex + 1);
          const nextNextQuestion = questions[nextIndex + 1];
          const nextNextValue = formData[nextNextQuestion.id as keyof typeof formData] || "";
          setInputValue(nextNextValue);
        } else {
          setInputValue(nextValue);
        }
        
        setError("");
        setIsAnimatingOut(false);
        // Animation will be triggered by useEffect
      }, 500);
    } else {
      // Submit form
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev - 1);
        const prevQuestion = questions[currentQuestionIndex - 1];
        setInputValue(formData[prevQuestion.id as keyof typeof formData] || "");
        setError("");
        setIsAnimatingOut(false);
        // Animation will be triggered by useEffect
      }, 500);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Salvar dados do cliente no localStorage para o resumo do pedido
      localStorage.setItem('checkout_customer_data', JSON.stringify({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        number: formData.number,
        district: formData.district,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
      }));

      // Redirecionar para página de resumo do pedido
      router.push(`/checkout/resumo?code=${code}`);
      
    } catch (error) {
      console.error('Erro ao processar checkout:', error);
      setError('Erro ao processar pedido. Tente novamente.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  useEffect(() => {
    // Reset and restart animation when question changes
    revealRef.current?.reset();
    
    const timer = setTimeout(() => {
      revealRef.current?.startAnimation();
    }, 600); // Slightly longer than fade transition (500ms)
    
    return () => clearTimeout(timer);
  }, [currentQuestionIndex]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Back Button */}
        {currentQuestionIndex > 0 && (
          <div className="absolute top-8 left-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          </div>
        )}

        <div className="min-h-[400px] flex flex-col justify-center">
          <div className={`transition-opacity duration-500 ${isAnimatingOut ? 'opacity-0' : 'opacity-100'}`}>
            {/* Animated Text */}
            <div className="mb-12">
              <VerticalCutReveal
                ref={revealRef}
                splitBy="characters"
                staggerDuration={0.03}
                staggerFrom="first"
                transition={{
                  type: "spring",
                  stiffness: 190,
                  damping: 22,
                }}
                containerClassName="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 text-center"
              >
                {currentQuestion.animationText}
              </VerticalCutReveal>
            </div>

            {/* Input Field and Button */}
            {currentQuestion.id !== 'welcome' && (
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type={currentQuestion.type === 'cpf' || currentQuestion.type === 'cep' ? 'text' : currentQuestion.type}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={currentQuestion.placeholder}
                    className="w-full text-lg px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-0 transition-colors duration-200 bg-white"
                    autoFocus
                    disabled={loading && currentQuestion.id === 'postal_code'}
                  />
                  {loading && currentQuestion.id === 'postal_code' && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                {successMessage && (
                  <p className="text-green-600 text-sm text-center">{successMessage}</p>
                )}
                
                {/* Button positioned below and to the right */}
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={loading || (currentQuestion.id !== 'welcome' && !inputValue)}
                    className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {loading ? "Processando..." : currentQuestionIndex === questions.length - 1 ? "Ver Resumo do Pedido" : "Continuar"}
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Welcome screen button */}
            {currentQuestion.id === 'welcome' && (
              <div className="flex justify-center">
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
                >
                  Começar
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}