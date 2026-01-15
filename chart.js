// Set chart dimensions and margins
const margin = { top: 30, right: 100, bottom: 60, left: 260 };
const width = 900 - margin.left - margin.right;
let currentHeight = 500 - margin.top - margin.bottom;

// State variables
let showAll = false;
let allData = [];

// Create SVG container
const svgContainer = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", currentHeight + margin.top + margin.bottom);

const svg = svgContainer
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load CSV data
d3.csv("boston_311_2025_by_reason.csv").then(function(data) {
    
    // Convert Count column to numeric type and sort
    data.forEach(d => {
        d.Count = +d.Count;
    });
    
    // Sort by Count in descending order
    allData = data.sort((a, b) => b.Count - a.Count);
    
    // Initially draw top 10
    drawChart(allData.slice(0, 10));
    
    // Add button event listener
    d3.select("#toggleBtn").on("click", function() {
        showAll = !showAll;
        
        // Update button text
        d3.select(this).text(showAll ? "Show Top 10 Only" : "Show All Reasons");
        
        // Redraw chart
        if (showAll) {
            drawChart(allData);
        } else {
            drawChart(allData.slice(0, 10));
        }
    });

}).catch(function(error) {
    console.error("Error loading the CSV file:", error);
    d3.select("#chart")
        .append("p")
        .style("color", "red")
        .text("Failed to load data file. Please ensure boston_311_2025_by_reason.csv exists.");
});

// Draw chart function
function drawChart(data) {
    // Clear existing content
    svg.selectAll("*").remove();
    
    // Reverse array so largest is at top
    const chartData = [...data].reverse();
    
    // Dynamically adjust height based on data count
    const barHeight = 35;
    const newHeight = Math.max(400, chartData.length * barHeight);
    currentHeight = newHeight;
    
    // Update SVG height
    svgContainer
        .transition()
        .duration(500)
        .attr("height", newHeight + margin.top + margin.bottom);
    
    // Create X axis scale (numeric)
    const x = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.Count)])
        .range([0, width]);
    
    // Create Y axis scale (categorical)
    const y = d3.scaleBand()
        .domain(chartData.map(d => d.reason))
        .range([newHeight, 0])
        .padding(0.25);
    
    // Add grid lines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${newHeight})`)
        .call(d3.axisBottom(x)
            .ticks(6)
            .tickSize(-newHeight)
            .tickFormat(""))
        .selectAll("line")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-dasharray", "3,3");
    
    svg.select(".grid .domain").remove();

    // Add X axis
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${newHeight})`)
        .call(d3.axisBottom(x)
            .ticks(6)
            .tickFormat(d => {
                if (d >= 1000) {
                    return d3.format(".0f")(d / 1000) + "K";
                }
                return d;
            }));
    
    // Add X axis title
    svg.append("text")
        .attr("class", "axis-title")
        .attr("x", width / 2)
        .attr("y", newHeight + 45)
        .attr("text-anchor", "middle")
        .text("Number of Calls");
    
    // Add Y axis
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(y));

    // Define color scale
    const colorScale = d3.scaleLinear()
        .domain([d3.min(chartData, d => d.Count), d3.max(chartData, d => d.Count)])
        .range(["#a29bfe", "#6c5ce7"]);

    // Create bars
    svg.selectAll(".bar")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.reason))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", 0)
        .attr("fill", d => colorScale(d.Count))
        .attr("rx", 4)
        .attr("ry", 4)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "#fd79a8");
            
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`<strong>${d.reason}</strong><br/>Calls: ${d3.format(",")(d.Count)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", colorScale(d.Count));
            
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .duration(600)
        .delay((d, i) => i * 30)
        .attr("width", d => x(d.Count));
    
    // Add value labels
    svg.selectAll(".bar-label")
        .data(chartData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("y", d => y(d.reason) + y.bandwidth() / 2)
        .attr("x", d => x(d.Count) + 5)
        .attr("dy", "0.35em")
        .attr("opacity", 0)
        .text(d => d3.format(",")(d.Count))
        .transition()
        .duration(600)
        .delay((d, i) => i * 30 + 300)
        .attr("opacity", 1);
}
