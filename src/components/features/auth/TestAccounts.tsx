'use client';

interface TestAccountsProps {
  onUseAccount: (email: string, password: string) => void;
}

const testAccounts = [
  {
    email: 'viewer@test.com',
    password: 'viewer123',
    role: 'Просмотр',
  },
  {
    email: 'editor@test.com',
    password: 'editor123',
    role: 'Редактирование',
  },
  {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'Администратор',
  },
];

export function TestAccounts({ onUseAccount }: TestAccountsProps) {
  const handleUseAccount = (email: string, password: string) => {
    console.log('TestAccounts: handleUseAccount called with:', { email, password }); // Отладочный вывод
    onUseAccount(email, password);
  };

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium text-gray-900">Тестовые аккаунты</h3>
      <div className="mt-4 space-y-4">
        {testAccounts.map((account) => (
          <div key={account.email} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{account.role}</p>
              <p className="text-sm text-gray-500">{account.email}</p>
            </div>
            <button
              type="button"
              onClick={() => handleUseAccount(account.email, account.password)}
              className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Использовать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 