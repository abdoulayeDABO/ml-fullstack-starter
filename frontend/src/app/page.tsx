"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type PredictionResponse = {
  prediction: number;
  probability: number;
};

type FormState = {
  pregnancies: string;
  glucose: string;
  blood_pressure: string;
  skin_thickness: string;
  insulin: string;
  bmi: string;
  diabetes_pedigree_function: string;
  age: string;
};

type FormKey = keyof FormState;

type FieldDefinition = {
  key: FormKey;
  label: string;
  inputMode: "numeric" | "decimal";
  placeholder: string;
  helperText: string;
};

const initialValues: FormState = {
  pregnancies: "6",
  glucose: "148",
  blood_pressure: "72",
  skin_thickness: "35",
  insulin: "0",
  bmi: "33.6",
  diabetes_pedigree_function: "0.627",
  age: "50",
};

const fields: FieldDefinition[] = [
  {
    key: "pregnancies",
    label: "Nombre de grossesses",
    inputMode: "numeric",
    placeholder: "ex: 6",
    helperText: "Nombre total de grossesses.",
  },
  {
    key: "glucose",
    label: "Glucose",
    inputMode: "decimal",
    placeholder: "ex: 148 mg/dL",
    helperText: "Niveau de glucose dans le sang.",
  },
  {
    key: "blood_pressure",
    label: "Pression artérielle",
    inputMode: "decimal",
    placeholder: "ex: 72 mmHg",
    helperText: "Pression artérielle diastolique.",
  },
  {
    key: "skin_thickness",
    label: "Épaisseur du pli cutané",
    inputMode: "decimal",
    placeholder: "ex: 35",
    helperText: "Mesure du pli cutané (triceps).",
  },
  {
    key: "insulin",
    label: "Insuline",
    inputMode: "decimal",
    placeholder: "ex: 0 μU/mL",
    helperText: "Taux d'insuline dans le sang.",
  },
  {
    key: "bmi",
    label: "IMC",
    inputMode: "decimal",
    placeholder: "ex: 33.6",
    helperText: "Indice de masse corporelle.",
  },
  {
    key: "diabetes_pedigree_function",
    label: "Indice héréditaire diabète",
    inputMode: "decimal",
    placeholder: "ex: 0.627",
    helperText: "Facteur lié aux antécédents familiaux.",
  },
  {
    key: "age",
    label: "Âge",
    inputMode: "numeric",
    placeholder: "ex: 50",
    helperText: "Âge de la personne en années.",
  },
];

const integerPattern = /^[0-9]+$/;
const decimalPattern = /^(?:[0-9]+(?:[.,][0-9]+)?|[.,][0-9]+)$/;

const normalizeNumericValue = (value: string) => value.trim().replace(",", ".");

const toPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export default function Home() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [values, setValues] = useState<FormState>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormKey, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "/";

  const endpoint = useMemo(() => {
    return `${apiBaseUrl.replace(/\/$/, "")}/api/v1/predict`;
  }, [apiBaseUrl]);

  const validateAndBuildPayload = () => {
    const nextErrors: Partial<Record<FormKey, string>> = {};
    const payload = {} as Record<FormKey, number>;

    for (const field of fields) {
      const rawValue = values[field.key];
      const normalizedValue = normalizeNumericValue(rawValue);
      const isInteger = field.inputMode === "numeric";

      if (!normalizedValue) {
        nextErrors[field.key] = "Ce champ est requis.";
        continue;
      }

      const isValidFormat = isInteger
        ? integerPattern.test(normalizedValue)
        : decimalPattern.test(normalizedValue);

      if (!isValidFormat) {
        nextErrors[field.key] = isInteger
          ? "Entrez un nombre entier valide."
          : "Entrez un nombre valide (ex: 33.6).";
        continue;
      }

      const numericValue = Number(normalizedValue);
      if (!Number.isFinite(numericValue)) {
        nextErrors[field.key] = "Valeur numérique invalide.";
        continue;
      }

      payload[field.key] = numericValue;
    }

    return {
      payload,
      errors: nextErrors,
      hasErrors: Object.keys(nextErrors).length > 0,
    };
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setLoading(true);
    setError(null);
    setResult(null);

    const validation = validateAndBuildPayload();
    if (validation.hasErrors) {
      setFieldErrors(validation.errors);
      setError("Certains champs sont invalides. Merci de corriger le formulaire.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { detail?: string }
          | null;
        throw new Error(body?.detail ?? `Erreur API (${response.status})`);
      }

      const data = (await response.json()) as PredictionResponse;
      setResult(data);
    } catch (submitError) {
      const technicalMessage =
        submitError instanceof Error
          ? submitError.message
          : "Erreur inconnue";

      setError(
        `Impossible d'obtenir une prédiction pour le moment. Vérifiez la connexion à l'API puis réessayez. (${technicalMessage})`,
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "theme-input w-full rounded-lg px-3 py-2.5 text-sm outline-none transition focus:border-(--clr-primary-a0) focus:ring-2 focus:ring-(--clr-primary-a0)/25";

  const panelClassName =
    "theme-panel rounded-lg";

  const predictionSummary = useMemo(() => {
    if (!result) {
      return null;
    }

    const rawProbability = Number.isFinite(result.probability)
      ? Math.min(Math.max(result.probability, 0), 1)
      : 0;
    const isHighRisk = result.prediction === 1 || rawProbability >= 0.5;
    const confidence = isHighRisk ? rawProbability : 1 - rawProbability;

    return {
      isHighRisk,
      riskLabel: isHighRisk ? "Risque élevé" : "Risque faible",
      riskProbability: rawProbability,
      confidence,
      recommendation: isHighRisk
        ? "Nous vous recommandons de consulter un professionnel de santé pour une évaluation médicale complète."
        : "Le risque estimé est faible. Continuez à suivre de bonnes habitudes de santé et un suivi régulier.",
    };
  }, [result]);

  if (isPageLoading) {
    return (
      <main className="theme-shell relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className={`relative z-10 flex flex-col items-center gap-4 px-10 py-8 ${panelClassName}`}>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-(--clr-surface-a20) border-t-(--clr-primary-a0)" />
          <p className="text-base font-semibold tracking-wide text-(--clr-light-a0)">
            Chargement de l&apos;interface...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="theme-shell relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-6xl">
        <div className={`mb-6 p-6 sm:mb-8 sm:p-8 ${panelClassName}`}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-(--clr-primary-a20)">
            Assistant de prévention
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-(--clr-light-a0) sm:text-3xl">
            Prédiction du risque diabète
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-(--clr-light-a0)">
            Complétez les informations ci-dessous pour obtenir une estimation claire du
            niveau de risque.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form
            onSubmit={onSubmit}
            className={`grid gap-5 p-6 sm:p-8 ${panelClassName}`}
            noValidate
          >
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => {
                const fieldId = `field-${field.key}`;
                const errorId = `${fieldId}-error`;
                const hasError = Boolean(fieldErrors[field.key]);
                const helperId = `${fieldId}-hint`;
                return (
                  <div key={field.key} className="space-y-1">
                    <label htmlFor={fieldId} className="text-sm font-medium text-(--clr-light-a0)">
                      {field.label}
                    </label>
                    <input
                      id={fieldId}
                      className={inputClassName}
                      type="text"
                      inputMode={field.inputMode}
                      autoComplete="off"
                      placeholder={field.placeholder}
                      value={values[field.key]}
                      onChange={(event) =>
                        setValues((previous) => ({
                          ...previous,
                          [field.key]: event.target.value,
                        }))
                      }
                      aria-invalid={hasError}
                      aria-describedby={hasError ? `${helperId} ${errorId}` : helperId}
                      required
                    />
                    <p id={helperId} className="text-sm leading-6 text-(--clr-surface-tonal-a50)">
                      {field.helperText}
                    </p>
                    {hasError ? (
                      <p id={errorId} className="text-sm font-semibold text-(--clr-danger-a20)" role="alert">
                        {fieldErrors[field.key]}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className="theme-button-primary inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--clr-primary-a20) focus-visible:ring-offset-2 focus-visible:ring-offset-(--clr-surface-a10) disabled:cursor-not-allowed disabled:border-(--clr-surface-tonal-a20) disabled:bg-(--clr-surface-a30) disabled:text-(--clr-surface-a50)"
              disabled={loading}
            >
              {loading ? "Analyse en cours..." : "Obtenir l'estimation"}
            </button>
          </form>

          <aside className={`p-6 ${panelClassName}`}>
            <h2 className="mb-4 text-lg font-semibold text-(--clr-light-a0)">Résultat</h2>

            {error ? (
              <div className="rounded-lg border border-(--clr-danger-a0) bg-(--clr-danger-a0)/20 p-4 text-base leading-7 text-(--clr-danger-a20)">
                {error}
              </div>
            ) : null}

            {predictionSummary ? (
              <div
                className={`rounded-lg border p-4 text-base leading-7 ${
                  predictionSummary.isHighRisk
                    ? "border-(--clr-warning-a0) bg-(--clr-warning-a0)/20 text-(--clr-warning-a20)"
                    : "border-(--clr-success-a0) bg-(--clr-success-a0)/20 text-(--clr-success-a20)"
                }`}
              >
                <p className="text-lg font-semibold">{predictionSummary.riskLabel}</p>
                <p className="mt-2">
                  Probabilité estimée de risque de diabète: {toPercent(predictionSummary.riskProbability)}
                </p>
                <p>
                  Niveau de confiance du modèle: {toPercent(predictionSummary.confidence)}
                </p>
                <p className="mt-2 text-sm leading-6">
                  {predictionSummary.recommendation}
                </p>
                <p className="mt-2 text-sm leading-6">
                  Ce résultat est une aide informative et ne remplace pas un avis médical.
                </p>
              </div>
            ) : null}

            {!loading && !error && !predictionSummary ? (
              <p className="text-base leading-7 text-(--clr-light-a0)">
                Remplissez le formulaire puis cliquez sur « Obtenir l'estimation » pour
                afficher un résultat clair.
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
