export const checkNullOnFormData = (value: unknown): boolean => {
  return (
    value === null || value === undefined || (typeof value === 'string' && (value.trim() === '' || value === 'null'))
  );
};
