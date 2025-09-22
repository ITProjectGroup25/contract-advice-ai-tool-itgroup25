const ErrorText = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm text-red-600">{children}</p>;
};

export default ErrorText;
