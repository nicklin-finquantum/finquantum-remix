export const AuthAbout = () => (
  <div className="flex flex-col justify-center space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              See what you can do with FinQuantum Inc.
      </h1>
      <p className="mt-4 text-lg text-gray-600">
              Join thousands of professionals who trust FinQuantum for their financial analytics and quantitative research needs.
      </p>
    </div>

    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Advanced Analytics</h3>
          <p className="text-sm text-gray-600">
                  Powerful tools for financial modeling and risk analysis
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Real-time Data</h3>
          <p className="text-sm text-gray-600">
                  Access to live market data and financial information
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Collaborative Platform</h3>
          <p className="text-sm text-gray-600">
                  Share insights and collaborate with your team
          </p>
        </div>
      </div>
    </div>
  </div>
);