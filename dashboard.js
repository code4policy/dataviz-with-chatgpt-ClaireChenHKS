// Set chart dimensions and margins
const margin = { top: 40, right: 30, bottom: 60, left: 70 };
const width = 860 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

// Store all data globally
let allData = [];
let currentSortBy = "month"; // "month" or "count"

// Create SVG container
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Month order for sorting
const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Load CSV data with detailed breakdown
d3.csv("boston_311_detailed.csv").then(function(data) {
    
    // Convert count to numeric and clean whitespace
    data.forEach(d => {
        d.count = +d.count;
        d.month = +d.month;
        d.neighborhood = d.neighborhood ? d.neighborhood.trim() : "";
        d.reason = d.reason ? d.reason.trim() : "";
    });
    
    allData = data;
    
    // Get unique reasons and neighborhoods
    const reasons = [...new Set(data.map(d => d.reason))].filter(r => r && r.trim() !== "").sort();
    const neighborhoods = [...new Set(data.map(d => d.neighborhood))].filter(n => n && n.trim() !== "" && n !== "Unknown").sort();
    
    // Populate reason dropdown
    const reasonDropdown = d3.select("#reasonFilter");
    reasons.forEach(reason => {
        reasonDropdown.append("option")
            .attr("value", reason)
            .text(reason);
    });
    
    // Populate neighborhood dropdown
    const neighborhoodDropdown = d3.select("#neighborhoodFilter");
    neighborhoods.forEach(neighborhood => {
        neighborhoodDropdown.append("option")
            .attr("value", neighborhood)
            .text(neighborhood);
    });
    
    // Initial chart
    updateChart();
    
    // Event listeners for filters
    reasonDropdown.on("change", updateChart);
    neighborhoodDropdown.on("change", updateChart);
    
    // Sort button event listeners
    d3.select("#sortMonth").on("click", function() {
        currentSortBy = "month";
        d3.select("#sortMonth").classed("active", true);
        d3.select("#sortCount").classed("active", false);
        updateChart();
    });
    
    d3.select("#sortCount").on("click", function() {
        currentSortBy = "count";
        d3.select("#sortCount").classed("active", true);
        d3.select("#sortMonth").classed("active", false);
        updateChart();
    });

}).catch(function(error) {
    console.error("Error loading the CSV file:", error);
    d3.select("#chart")
        .append("p")
        .style("color", "red")
        .style("text-align", "center")
        .text("Failed to load data file. Please ensure boston_311_detailed.csv exists.");
});

// Update chart based on current filters
function updateChart() {
    const selectedReason = d3.select("#reasonFilter").property("value");
    const selectedNeighborhood = d3.select("#neighborhoodFilter").property("value");
    
    // Filter data
    let filteredData = allData;
    
    if (selectedReason !== "all") {
        filteredData = filteredData.filter(d => d.reason === selectedReason);
    }
    
    if (selectedNeighborhood !== "all") {
        filteredData = filteredData.filter(d => d.neighborhood === selectedNeighborhood);
    }
    
    // Aggregate by month
    const monthCounts = d3.rollup(filteredData,
        v => d3.sum(v, d => d.count),
        d => d.month_name
    );
    
    let chartData = monthOrder.map(month => ({
        month_name: month,
        count: monthCounts.get(month) || 0
    }));
    
    // Sort based on current sort setting
    if (currentSortBy === "count") {
        chartData.sort((a, b) => b.count - a.count);
    }
    
    // Update statistics
    updateStats(chartData);
    
    // Draw the chart
    drawChart(chartData, selectedReason, selectedNeighborhood);
}

// Update statistics cards
function updateStats(chartData) {
    const total = d3.sum(chartData, d => d.count);
    const avg = Math.round(total / 12);
    const max = d3.max(chartData, d => d.count);
    const min = d3.min(chartData, d => d.count);
    const peakMonth = chartData.find(d => d.count === max)?.month_name || "-";
    const lowMonth = chartData.find(d => d.count === min)?.month_name || "-";
    
    // Animate numbers
    animateValue("totalComplaints", total);
    animateValue("avgComplaints", avg);
    d3.select("#peakMonth").text(peakMonth);
    d3.select("#lowMonth").text(lowMonth);
}

// Animate number counting
function animateValue(elementId, endValue) {
    const element = document.getElementById(elementId);
    const startValue = parseInt(element.textContent.replace(/,/g, "")) || 0;
    const duration = 500;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);
        element.textContent = d3.format(",")(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Draw chart function
function drawChart(chartData, selectedReason, selectedNeighborhood) {
    // Clear existing chart elements
    svg.selectAll("*").remove();
    
    // Create X scale (categorical - months)
    const x = d3.scaleBand()
        .domain(chartData.map(d => d.month_name))
        .range([0, width])
        .padding(0.2);
    
    // Create Y scale (numeric - count)
    const maxCount = d3.max(chartData, d => d.count) || 1;
    const y = d3.scaleLinear()
        .domain([0, maxCount * 1.15])
        .range([height, 0]);
    
    // Add grid lines
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .ticks(6)
            .tickSize(-width)
            .tickFormat(""))
        .selectAll("line")
        .attr("stroke", "#e9ecef")
        .attr("stroke-dasharray", "3,3");
    
    svg.select(".grid .domain").remove();
    
    // Add X axis
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-weight", "600");
    
    // Add Y axis
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(y)
            .ticks(6)
            .tickFormat(d => {
                if (d >= 1000) {
                    return d3.format(".0f")(d / 1000) + "K";
                }
                return d;
            }));
    
    // Add Y axis title
    svg.append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Number of Complaints");
    
    // Define color scale - gradient from light blue to dark blue
    const colorScale = d3.scaleLinear()
        .domain([0, maxCount])
        .range(["#74b9ff", "#0984e3"]);
    
    // Create bars with enhanced interactivity
    const bars = svg.selectAll(".bar")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.month_name))
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", d => colorScale(d.count))
        .attr("rx", 4)
        .attr("ry", 4)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            // Dim other bars
            bars.transition()
                .duration(200)
                .style("opacity", 0.4);
            
            // Highlight current bar
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "#fdcb6e")
                .style("opacity", 1)
                .attr("transform", `translate(0, -5)`);
            
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.95);
            
            const reasonText = selectedReason === "all" ? "All Types" : selectedReason;
            const neighborhoodText = selectedNeighborhood === "all" ? "All Neighborhoods" : selectedNeighborhood;
            
            tooltip.html(`
                <strong>${d.month_name} 2025</strong><br/>
                <span style="color: #adb5bd;">Type:</span> ${reasonText}<br/>
                <span style="color: #adb5bd;">Area:</span> ${neighborhoodText}<br/>
                <span style="color: #ffc107; font-size: 16px;">Count: ${d3.format(",")(d.count)}</span>
            `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 40) + "px");
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", function(event, d) {
            // Restore all bars
            bars.transition()
                .duration(200)
                .style("opacity", 1)
                .attr("fill", d => colorScale(d.count))
                .attr("transform", "translate(0, 0)");
            
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function(event, d) {
            // Flash effect on click
            d3.select(this)
                .transition()
                .duration(100)
                .attr("fill", "#fff")
                .transition()
                .duration(100)
                .attr("fill", "#fdcb6e");
        });
    
    // Animate bars entrance
    bars.transition()
        .duration(600)
        .delay((d, i) => i * 40)
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count));
    
    // Add value labels on top of bars
    svg.selectAll(".bar-label")
        .data(chartData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.month_name) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 8)
        .attr("opacity", 0)
        .text(d => d.count > 0 ? d3.format(",")(d.count) : "")
        .transition()
        .duration(600)
        .delay((d, i) => i * 40 + 300)
        .attr("opacity", 1);
}
